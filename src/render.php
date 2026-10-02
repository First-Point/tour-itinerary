<?php
/**
 * Front-end output: the saved itinerary markup plus its structured data.
 *
 * The structured data is built in the editor (with the tourist-trip-schema
 * library) and stored in the `schema` attribute. Here it is only completed
 * with values that belong to the page rather than the block (title, address,
 * featured image) and printed. Kept minimal on purpose.
 *
 * @package TourItinerary
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Saved block markup.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Saved markup was already filtered when the post was saved.
echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

if ( is_feed() || empty( $attributes['schema'] ) || ! is_array( $attributes['schema'] ) ) {
	return;
}

$tour_itinerary_schema = tour_itinerary_decode( $attributes['schema'] );
if ( ! isset( $tour_itinerary_schema['@type'] ) || 'TouristTrip' !== $tour_itinerary_schema['@type'] ) {
	return;
}

$tour_itinerary_post_id = isset( $block->context['postId'] ) ? (int) $block->context['postId'] : (int) get_the_ID();

if ( $tour_itinerary_post_id ) {
	// No name of its own: follow the current page title.
	if ( empty( $attributes['name'] ) ) {
		$tour_itinerary_title = trim( wp_strip_all_tags( html_entity_decode( get_the_title( $tour_itinerary_post_id ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) ) );
		if ( '' !== $tour_itinerary_title ) {
			$tour_itinerary_schema['name'] = $tour_itinerary_title;
		}
	}
	if ( empty( $tour_itinerary_schema['url'] ) ) {
		$tour_itinerary_url = get_permalink( $tour_itinerary_post_id );
		if ( $tour_itinerary_url ) {
			$tour_itinerary_schema['url'] = $tour_itinerary_url;
		}
	}
	if ( empty( $tour_itinerary_schema['image'] ) ) {
		$tour_itinerary_image = get_the_post_thumbnail_url( $tour_itinerary_post_id, 'full' );
		if ( $tour_itinerary_image ) {
			$tour_itinerary_schema['image'] = $tour_itinerary_image;
		}
	}
}

if ( empty( $tour_itinerary_schema['name'] ) ) {
	return;
}

// JSON_HEX_TAG and JSON_HEX_AMP keep "</script>" in user text inert;
// U+2028/U+2029 stay escaped because JSON_UNESCAPED_LINE_TERMINATORS is off.
$tour_itinerary_json = wp_json_encode(
	$tour_itinerary_schema,
	JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
);

if ( $tour_itinerary_json ) {
	echo '<script type="application/ld+json">' . $tour_itinerary_json . '</script>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}
