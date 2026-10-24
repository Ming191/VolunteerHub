#!/usr/bin/env python3
"""Check Compose service bindings or scan a deployment from an external host."""

import argparse
import json
import socket
import subprocess
import sys


PRIVATE = ("postgres-db", "rabbitmq", "redis", "prometheus", "loki", "tempo", "promtail")
LOCAL = ("backend", "grafana", "rustfs", "storage-proxy")
PORTS_TO_SCAN = (5432, 5672, 6379, 9090, 15672, 15692, 3100, 3200, 3202, 14268, 9411, 8081, 8080, 3001, 9000, 9001, 9010)


def docker(*args):
    return subprocess.check_output(("docker", *args), text=True).strip()


def binding_errors(service, bindings, source):
    if service in PRIVATE:
        return [f"{source}: {service} publishes ports"] if bindings else []
    if not bindings:
        return [f"{source}: {service} has no loopback port"]
    errors = [f"{source}: {service} binds to {p.get('host_ip') or 'all interfaces'}"
              for p in bindings if p.get("host_ip") != "127.0.0.1"]
    if service == "backend":
        errors += [f"{source}: unexpected backend target port {p['target']}"
                   for p in bindings if p.get("target") != 8080]
    return errors


def verify_compose():
    config = json.loads(docker("compose", "config", "--format", "json"))
    errors = []
    for service in (*PRIVATE, *LOCAL):
        errors += binding_errors(service, config["services"][service].get("ports", []), "config")
    for network in ("data", "observability"):
        if not config["networks"].get(network, {}).get("internal"):
            errors.append(f"{network} must be an internal network")
    for service, network in (("backend", "data"), ("backend", "observability"),
                             ("prometheus", "observability"), ("postgres-db", "data"),
                             ("redis", "data"), ("rabbitmq", "data")):
        if network not in config["services"][service].get("networks", {}):
            errors.append(f"{service} must join {network}")
    return errors


def verify_running():
    errors = []
    for service in (*PRIVATE, *LOCAL):
        container_id = docker("compose", "ps", "-q", service)
        if not container_id:
            errors.append(f"{service} is not running")
            continue
        details = json.loads(docker("inspect", container_id))[0]
        bindings = [{"host_ip": item["HostIp"], "target": int(target.split("/")[0])}
                    for target, entries in details["NetworkSettings"]["Ports"].items()
                    for item in (entries or [])]
        errors += binding_errors(service, bindings, "runtime")
    return errors


def external_scan(host, extra_ports=()):
    errors = []
    for port in (*PORTS_TO_SCAN, *extra_ports):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(0.5)
            if sock.connect_ex((host, port)) == 0:
                errors.append(f"external scan: {host}:{port} accepts TCP connections")
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--external-host", help="Run on ANOTHER computer against deployment host IP")
    parser.add_argument("--extra-port", action="append", type=int, default=[],
                        help="Also scan a custom host port (for example GRAFANA_HOST_PORT)")
    parser.add_argument("--config-only", action="store_true")
    args = parser.parse_args()
    try:
        errors = external_scan(args.external_host, args.extra_port) if args.external_host else verify_compose()
        if not args.external_host and not args.config_only:
            errors += verify_running()
    except (OSError, subprocess.CalledProcessError, KeyError, ValueError) as exc:
        print(f"Unable to verify: {exc}", file=sys.stderr)
        return 2
    for error in errors:
        print("FAIL:", error)
    if not errors:
        print("PASS: exposure checks")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
