PYTHON_PID_FILE=.python.pid
NODE_PID_FILE=.node.pid

start:
	@python3 -m http.server 8081 & echo $$! > $(PYTHON_PID_FILE)
	@node server.js & echo $$! > $(NODE_PID_FILE)

stop:
	@if [ -f $(PYTHON_PID_FILE) ]; then \
		kill `cat $(PYTHON_PID_FILE)` && rm $(PYTHON_PID_FILE); \
	fi
	@if [ -f $(NODE_PID_FILE) ]; then \
		kill `cat $(NODE_PID_FILE)` && rm $(NODE_PID_FILE); \
	fi

.PHONY: start stop
