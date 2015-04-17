This is a script for creating mappings between New Jersey Transit (NJT) GTFS ids and shortcodes, which are used for the realtime API.

It seems like this may be a common need, so I'm putting it out on github to help anyone who needs to do the same thing.

The GFTS stops.txt and shortcode list are current as of 4/17/15 but may need to be updated in the future.

There are not always one-to-one mappings between GTFS and shortcodes, and these mismatches can be managed in overrides.txt.

To run locally with node JS just run:
```
npm install;
node index.js;
```
