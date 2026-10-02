=== Tour Itinerary ===
Contributors: yournexttours
Tags: itinerary, tour, travel, schema, structured data
Requires at least: 6.5
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A day-by-day tour programme block with stops and times. Adds schema.org TouristTrip structured data to the page.

== Description ==

Tour Itinerary adds one block to the editor: a clean, theme-friendly timeline of your tour, day by day and stop by stop.

* Add days, stops, times, short descriptions and addresses.
* Mark meals, meeting points and transfers as "not a sight".
* One untitled day shows as a simple list; named days get their own headings.
* Works with any theme: colors follow your theme, and right-to-left languages are supported.

The block also adds schema.org TouristTrip structured data (JSON-LD) to the page, describing the trip, its days and its stops. Search engines and AI assistants use this data to understand what the tour includes. The page address, and the featured image if you do not choose one, are added automatically.

What it does not do:

* No booking, payments or account. Everything works inside the editor, with no external service.
* No ratings or reviews in the structured data. Self-declared ratings can get a site penalized.
* Google does not currently show a special search result for tours, so the structured data will not change how your result looks by itself.

The structured data is built with the open source [tourist-trip-schema](https://github.com/First-Point/tourist-trip-schema) library.

Tour Itinerary is made by [Your Next Tours](https://yournext.tours), a live audio guide system for tour groups.

== Installation ==

1. Install the plugin from Plugins > Add New, or search for "Tour Itinerary" in the block inserter.
2. Add the Tour Itinerary block to a page or post.
3. Add stops, then use the sidebar for the trip name, organizer and price.

== Frequently Asked Questions ==

= Where does the trip name come from? =

From the "Trip name" field in the block sidebar. If you leave it empty, the page title is used.

= How do I check the structured data? =

Open the "Structured data" panel in the block sidebar to see what is added. After publishing, you can test the page with the Schema Markup Validator at validator.schema.org.

= The structured data is not added. Why? =

The block shows a warning listing what needs fixing, for example a stop without a name or a price without a currency. Nothing is added until it is fixed, so invalid data never reaches the page.

= Can I show stop times without dates? =

Yes. Times such as 09:30 are shown as written. In the structured data, the first and last times of a day become its departure and arrival times.

= Does it work for users who are not administrators? =

Yes. Authors and contributors can use the block. WordPress filters their content more strictly; the block handles that, so characters such as "&" are shown correctly.

== Screenshots ==

1. A two-day itinerary on the front end.
2. Editing stops in the block.
3. The structured data panel.

== Changelog ==

= 0.1.0 =
* First release.
