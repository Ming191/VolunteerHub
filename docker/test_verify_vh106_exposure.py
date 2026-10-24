"""Fast tests for the VH-106 port-binding verifier, no Docker daemon needed."""

import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch


script = Path(__file__).with_name("verify-vh106-exposure.py")
spec = importlib.util.spec_from_file_location("vh106_verify", script)
verifier = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verifier)


class BindingTests(unittest.TestCase):
    def test_internal_service_cannot_publish_any_port(self):
        self.assertEqual([], verifier.binding_errors("postgres-db", [], "config"))
        self.assertTrue(verifier.binding_errors("postgres-db", [{"host_ip": "127.0.0.1"}], "config"))

    def test_local_services_must_bind_ipv4_loopback(self):
        self.assertEqual([], verifier.binding_errors("backend", [{"host_ip": "127.0.0.1"}], "runtime"))
        for host_ip in ("", "0.0.0.0", "::", "::1"):
            with self.subTest(host_ip=host_ip):
                self.assertTrue(verifier.binding_errors("backend", [{"host_ip": host_ip}], "runtime"))

    @patch.object(verifier, "docker")
    def test_compose_config_requires_internal_networks(self, docker):
        import json

        config = {
            "services": {name: {"ports": []} for name in verifier.PRIVATE},
            "networks": {"data": {"internal": True}, "observability": {"internal": True}},
        }
        config["services"].update({name: {"ports": [{"host_ip": "127.0.0.1"}]}
                                   for name in verifier.LOCAL})
        docker.return_value = json.dumps(config)
        self.assertEqual([], verifier.verify_compose())
        config["networks"]["observability"]["internal"] = False
        docker.return_value = json.dumps(config)
        self.assertTrue(verifier.verify_compose())


if __name__ == "__main__":
    unittest.main()
