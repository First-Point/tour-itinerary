/**
 * Turns `tourist-trip-schema` issues into translated, human-readable lines.
 * The library's own messages are English-only and name input paths; editors
 * need "Day 2, stop 3: ..." in their own language.
 */
import { __, sprintf } from '@wordpress/i18n';

const FIELD_LABELS = {
	name: () => __( 'Name', 'tour-itinerary' ),
	url: () => __( 'Link', 'tour-itinerary' ),
	image: () => __( 'Image', 'tour-itinerary' ),
	time: () => __( 'Time', 'tour-itinerary' ),
	type: () => __( 'Type', 'tour-itinerary' ),
	price: () => __( 'Price', 'tour-itinerary' ),
	priceCurrency: () => __( 'Currency', 'tour-itinerary' ),
	latitude: () => __( 'Latitude', 'tour-itinerary' ),
	longitude: () => __( 'Longitude', 'tour-itinerary' ),
};

const CODE_MESSAGES = {
	required: () => __( 'is required', 'tour-itinerary' ),
	invalid_url: () =>
		__(
			'must be a full web address starting with https://',
			'tour-itinerary'
		),
	invalid_time: () => __( 'must be a time such as 09:30', 'tour-itinerary' ),
	invalid_price: () =>
		__( 'must be a number such as 45 or 49.90', 'tour-itinerary' ),
	invalid_currency: () =>
		__( 'must be a three-letter code such as EUR', 'tour-itinerary' ),
	invalid_type: () => __( 'is not supported', 'tour-itinerary' ),
	out_of_range: () => __( 'is out of range', 'tour-itinerary' ),
};

function where( path ) {
	const stop = /^days\[(\d+)\]\.stops\[(\d+)\]/.exec( path );
	if ( stop ) {
		return sprintf(
			/* translators: 1: day number, 2: stop number */
			__( 'Day %1$d, stop %2$d', 'tour-itinerary' ),
			Number( stop[ 1 ] ) + 1,
			Number( stop[ 2 ] ) + 1
		);
	}
	if ( path.startsWith( 'provider' ) ) {
		return __( 'Organizer', 'tour-itinerary' );
	}
	if ( path.startsWith( 'offers' ) ) {
		return __( 'Price', 'tour-itinerary' );
	}
	return __( 'Trip', 'tour-itinerary' );
}

/**
 * @param {{path: string, code: string}} issue
 * @return {string} e.g. "Day 1, stop 2: Time must be a time such as 09:30"
 */
export function describeIssue( issue ) {
	const field = issue.path
		.split( '.' )
		.pop()
		.replace( /\[\d+\]$/, '' );
	const label = FIELD_LABELS[ field ]?.() ?? field;
	const message = CODE_MESSAGES[ issue.code ]?.() ?? issue.code;
	return sprintf(
		/* translators: 1: location such as "Day 1, stop 2", 2: field name, 3: problem */
		__( '%1$s: %2$s %3$s', 'tour-itinerary' ),
		where( issue.path ),
		label,
		message
	);
}
