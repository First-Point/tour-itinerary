<?php
/**
 * Plugin Name:       Tour Itinerary
 * Description:       A day-by-day tour programme block with stops and times. Adds schema.org TouristTrip structured data to the page.
 * Version:           0.1.0
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Author:            Your Next Tours
 * Author URI:        https://yournext.tours
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       tour-itinerary
 *
 * @package TourItinerary
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the block from its metadata.
 */
function tour_itinerary_register_block() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'tour_itinerary_register_block' );

/**
 * Decodes HTML entities in every string of a nested array.
 *
 * For users without the unfiltered_html capability WordPress filters block
 * attributes with kses on save, which turns "&" into "&amp;". The stored
 * structured data must be decoded before it is encoded as JSON again.
 *
 * @param mixed $value Attribute value.
 * @return mixed
 */
function tour_itinerary_decode( $value ) {
	if ( is_array( $value ) ) {
		return array_map( 'tour_itinerary_decode', $value );
	}
	if ( is_string( $value ) ) {
		return html_entity_decode( $value, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	}
	return $value;
}
