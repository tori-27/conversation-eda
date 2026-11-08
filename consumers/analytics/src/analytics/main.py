import os

ENV_VARS = ("KAFKA_BROKERS", "KAFKA_TOPIC")


def main() -> None:
    config = {name: os.environ.get(name) for name in ENV_VARS}
    print(f"[analytics] started with config: {config}")


if __name__ == "__main__":
    main()
