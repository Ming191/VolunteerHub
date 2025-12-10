export const MONITORING_URLS = {
    grafana: import.meta.env.VITE_GRAFANA_URL || 'http://localhost:3001',
    loki: import.meta.env.VITE_LOKI_EXPLORE_URL || 'http://localhost:3001/explore?left=%7B%22datasource%22:%22loki%22,%22queries%22:[%7B%22refId%22:%22A%22,%22expr%22:%22%7Bcontainer=%5C%22volunteerhub_backend%5C%22%7D%22%7D]%7D',
    tempo: import.meta.env.VITE_TEMPO_EXPLORE_URL || 'http://localhost:3001/explore?datasource=tempo',
    rabbitmq: import.meta.env.VITE_RABBITMQ_URL || 'http://localhost:15672',
};
