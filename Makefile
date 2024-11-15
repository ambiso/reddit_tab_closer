tab_closer.zip: background.js manifest.json
	zip -9 $@ $^

.PHONY: clean
clean:
	rm tab_closer.zip