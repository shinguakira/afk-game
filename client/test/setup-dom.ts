// Tell React that this environment supports act().
// Without this, React warns "not configured to support act()" in every DOM test.
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
