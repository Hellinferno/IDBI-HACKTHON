.PHONY: test dev install

test:
	cd $(shell pwd) && python -m pytest tests/ -v

dev:
	cd $(shell pwd) && python -m uvicorn engine.app:app --reload --port 8001

install:
	pip install -e ".[dev]"
