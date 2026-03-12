"""
Lightweight Docker container metrics exporter for Prometheus.
Reads stats from Docker Engine API via socket and exposes them
as Prometheus metrics on port 9200.
"""

import time
import threading
import logging

import docker
from prometheus_client import start_http_server, Gauge

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
logger = logging.getLogger(__name__)

SCRAPE_INTERVAL = 10  # seconds

cpu_usage = Gauge(
    "docker_container_cpu_percent",
    "CPU usage percentage",
    ["container_name", "compose_service"],
)

memory_usage = Gauge(
    "docker_container_memory_bytes",
    "Memory usage in bytes",
    ["container_name", "compose_service"],
)

memory_limit = Gauge(
    "docker_container_memory_limit_bytes",
    "Memory limit in bytes",
    ["container_name", "compose_service"],
)

memory_percent = Gauge(
    "docker_container_memory_percent",
    "Memory usage percentage",
    ["container_name", "compose_service"],
)

net_rx_bytes = Gauge(
    "docker_container_network_rx_bytes",
    "Total network bytes received",
    ["container_name", "compose_service"],
)

net_tx_bytes = Gauge(
    "docker_container_network_tx_bytes",
    "Total network bytes transmitted",
    ["container_name", "compose_service"],
)

container_running = Gauge(
    "docker_container_running",
    "1 if container is running, 0 otherwise",
    ["container_name", "compose_service"],
)


def _calc_cpu_percent(stats: dict) -> float:
    cpu = stats.get("cpu_stats", {})
    precpu = stats.get("precpu_stats", {})

    cpu_delta = cpu.get("cpu_usage", {}).get("total_usage", 0) - \
                precpu.get("cpu_usage", {}).get("total_usage", 0)
    system_delta = cpu.get("system_cpu_usage", 0) - \
                   precpu.get("system_cpu_usage", 0)

    ncpus = cpu.get("online_cpus", 1) or 1

    if system_delta > 0 and cpu_delta >= 0:
        return (cpu_delta / system_delta) * ncpus * 100.0
    return 0.0


def _sum_network(stats: dict, direction: str) -> int:
    networks = stats.get("networks", {})
    return sum(iface.get(direction, 0) for iface in networks.values())


def collect_metrics(client: docker.DockerClient):
    while True:
        try:
            containers = client.containers.list()
            seen = set()

            for container in containers:
                name = container.name
                labels = container.labels
                service = labels.get("com.docker.compose.service", name)
                seen.add((name, service))

                try:
                    stats = container.stats(stream=False)

                    cpu_pct = _calc_cpu_percent(stats)
                    cpu_usage.labels(container_name=name, compose_service=service).set(cpu_pct)

                    mem = stats.get("memory_stats", {})
                    mem_used = mem.get("usage", 0)
                    mem_lim = mem.get("limit", 0)

                    memory_usage.labels(container_name=name, compose_service=service).set(mem_used)
                    memory_limit.labels(container_name=name, compose_service=service).set(mem_lim)

                    if mem_lim > 0:
                        memory_percent.labels(container_name=name, compose_service=service).set(
                            (mem_used / mem_lim) * 100
                        )

                    net_rx_bytes.labels(container_name=name, compose_service=service).set(
                        _sum_network(stats, "rx_bytes")
                    )
                    net_tx_bytes.labels(container_name=name, compose_service=service).set(
                        _sum_network(stats, "tx_bytes")
                    )

                    container_running.labels(container_name=name, compose_service=service).set(1)

                except Exception as e:
                    logger.warning(f"Failed to get stats for {name}: {e}")

        except Exception as e:
            logger.error(f"Failed to list containers: {e}")

        time.sleep(SCRAPE_INTERVAL)


def main():
    client = docker.DockerClient(base_url="unix:///var/run/docker.sock")
    logger.info(f"Connected to Docker: {client.version()['Version']}")
    logger.info("Starting metrics server on :9200")

    start_http_server(9200)

    collector = threading.Thread(target=collect_metrics, args=(client,), daemon=True)
    collector.start()

    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
