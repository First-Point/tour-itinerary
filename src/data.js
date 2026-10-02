/**
 * Attribute helpers shared by the editor, the saved markup and the
 * structured data.
 *
 * Why every read goes through `clean()`: for users without the
 * `unfiltered_html` capability (Authors, Contributors, and everyone except
 * super admins on multisite) WordPress runs block attributes through kses
 * on save, which turns a bare "&" into "&amp;". Reading attributes as-is
 * would show "&amp;" in the inputs, render "&amp;amp;" on the page and mark
 * the block invalid on the next load. Decoding on every read makes the
 * round trip stable for all roles.
 */
import { decodeEntities } from '@wordpress/html-entities';

export function clean( value ) {
	if ( typeof value === 'string' ) {
		return decodeEntities( value );
	}
	if ( Array.isArray( value ) ) {
		return value.map( clean );
	}
	if ( value && typeof value === 'object' ) {
		const out = {};
		for ( const [ key, item ] of Object.entries( value ) ) {
			out[ key ] = clean( item );
		}
		return out;
	}
	return value;
}

export const emptyStop = () => ( {
	time: '',
	name: '',
	description: '',
	address: '',
	isPlace: false,
} );

export const emptyDay = () => ( {
	name: '',
	description: '',
	stops: [ emptyStop() ],
} );

const filled = ( value ) => typeof value === 'string' && value.trim() !== '';

/**
 * Days and stops as they appear on the page: stops without a name and days
 * with nothing to show are left out. Expects cleaned attributes.
 *
 * @param {Array} days
 */
export function visibleDays( days ) {
	return ( Array.isArray( days ) ? days : [] )
		.map( ( day ) => ( {
			name: filled( day?.name ) ? day.name.trim() : '',
			description: filled( day?.description )
				? day.description.trim()
				: '',
			stops: ( Array.isArray( day?.stops ) ? day.stops : [] )
				.filter( ( stop ) => filled( stop?.name ) )
				.map( ( stop ) => ( {
					time: filled( stop.time ) ? stop.time.trim() : '',
					name: stop.name.trim(),
					description: filled( stop.description )
						? stop.description.trim()
						: '',
					address: filled( stop.address ) ? stop.address.trim() : '',
				} ) ),
		} ) )
		.filter(
			( day ) => day.name || day.description || day.stops.length > 0
		);
}

/**
 * Maps block attributes to the `tourist-trip-schema` input.
 *
 * @param {Object} attributes Raw block attributes.
 * @param {string} postTitle  Fallback trip name.
 */
export function toTripInput( attributes, postTitle = '' ) {
	const a = clean( attributes );
	const input = {
		name: filled( a.name ) ? a.name : clean( postTitle ),
		description: a.description,
		image: a.image,
		touristType: ( a.audience || '' ).split( ',' ),
		provider: { name: a.providerName, url: a.providerUrl },
		days: ( Array.isArray( a.days ) ? a.days : [] ).map( ( day ) => ( {
			name: day?.name,
			description: day?.description,
			stops: ( Array.isArray( day?.stops ) ? day.stops : [] ).map(
				( stop ) => {
					const out = {
						name: stop?.name,
						description: stop?.description,
						time: stop?.time,
						address: stop?.address,
					};
					// Only set the type when it differs from the default: a type
					// on an otherwise blank row would stop the library from
					// treating it as an unused row.
					if ( stop?.isPlace ) {
						out.type = 'Place';
					}
					return out;
				}
			),
		} ) ),
	};
	if ( filled( a.price ) || filled( a.currency ) ) {
		input.offers = { price: a.price, priceCurrency: a.currency };
	}
	return input;
}
