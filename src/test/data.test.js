import { describe, expect, it, vi } from 'vitest';
import { renderToString } from '@wordpress/element';
import { tryBuildTouristTrip } from 'tourist-trip-schema';
import { clean, emptyDay, toTripInput, visibleDays } from '../data';
import { describeIssue } from '../issues';
import save from '../save';

vi.mock( '@wordpress/block-editor', () => ( {
	useBlockProps: {
		save: ( props = {} ) => ( {
			...props,
			className: 'wp-block-tour-itinerary-itinerary',
		} ),
	},
} ) );

const attrs = ( over = {} ) => ( {
	name: '',
	description: '',
	image: '',
	providerName: '',
	providerUrl: '',
	price: '',
	currency: '',
	audience: '',
	headingLevel: 3,
	days: [ emptyDay() ],
	...over,
} );

describe( 'toTripInput', () => {
	it( 'a new block with only a post title builds a minimal trip', () => {
		const result = tryBuildTouristTrip(
			toTripInput( attrs(), 'Old Town Walk' )
		);
		expect( result ).toEqual( {
			ok: true,
			data: {
				'@context': 'https://schema.org',
				'@type': 'TouristTrip',
				name: 'Old Town Walk',
			},
		} );
	} );

	it( 'reports a missing name when there is no title either', () => {
		const result = tryBuildTouristTrip( toTripInput( attrs(), '' ) );
		expect( result.ok ).toBe( false );
		expect( result.issues.map( ( i ) => i.path ) ).toEqual( [ 'name' ] );
	} );

	it( 'maps stops, place type, audience and price', () => {
		const result = tryBuildTouristTrip(
			toTripInput(
				attrs( {
					name: 'Walk',
					audience: 'Families, History enthusiasts ,',
					price: '45',
					currency: 'EUR',
					days: [
						{
							name: '',
							description: '',
							stops: [
								{
									time: '09:00',
									name: 'Hagia Sophia',
									description: '',
									address: '',
									isPlace: false,
								},
								{
									time: '12:00',
									name: 'Lunch',
									description: '',
									address: '',
									isPlace: true,
								},
								{
									time: '',
									name: '',
									description: '',
									address: '',
									isPlace: false,
								},
							],
						},
					],
				} )
			)
		);
		expect( result.ok ).toBe( true );
		expect( result.data.touristType ).toEqual( [
			'Families',
			'History enthusiasts',
		] );
		expect( result.data.offers ).toEqual( {
			'@type': 'Offer',
			price: 45,
			priceCurrency: 'EUR',
		} );
		expect( result.data.departureTime ).toBe( '09:00:00' );
		expect( result.data.arrivalTime ).toBe( '12:00:00' );
		expect(
			result.data.itinerary.itemListElement.map(
				( i ) => i.item[ '@type' ]
			)
		).toEqual( [ 'TouristAttraction', 'Place' ] );
	} );

	it( 'decodes entities that kses added for users without unfiltered_html', () => {
		const result = tryBuildTouristTrip(
			toTripInput(
				attrs( { name: 'Food &amp; Wine', providerName: 'A &#038; B' } )
			)
		);
		expect( result.data.name ).toBe( 'Food & Wine' );
		expect( result.data.provider.name ).toBe( 'A & B' );
	} );
} );

describe( 'visibleDays', () => {
	it( 'drops unnamed stops and empty days', () => {
		expect(
			visibleDays( [
				{ name: '', description: '', stops: [ { name: ' ' } ] },
				{
					name: 'Day 2',
					stops: [ { name: 'A', time: ' 10:00 ' }, { name: '' } ],
				},
			] )
		).toEqual( [
			{
				name: 'Day 2',
				description: '',
				stops: [
					{ time: '10:00', name: 'A', description: '', address: '' },
				],
			},
		] );
	} );
} );

describe( 'save', () => {
	const day = ( name, stopName ) => ( {
		name,
		description: '',
		stops: [
			{
				time: '09:00',
				name: stopName,
				description: '',
				address: '',
				isPlace: false,
			},
		],
	} );

	it( 'renders the same markup before and after kses', () => {
		const before = renderToString(
			save( {
				attributes: attrs( { days: [ day( '', 'Fish & Chips' ) ] } ),
			} )
		);
		const after = renderToString(
			save( {
				attributes: attrs( {
					days: [ day( '', 'Fish &amp; Chips' ) ],
				} ),
			} )
		);
		expect( after ).toBe( before );
		expect( before ).toContain( 'Fish &amp; Chips' );
		expect( before ).not.toContain( '&amp;amp;' );
	} );

	it( 'renders a flat list for one untitled day and headings for named days', () => {
		const flat = renderToString(
			save( { attributes: attrs( { days: [ day( '', 'A' ) ] } ) } )
		);
		expect( flat ).not.toContain( 'tour-itinerary__days' );
		expect( flat ).toContain(
			'<time class="tour-itinerary__time" datetime="09:00">09:00</time>'
		);

		const named = renderToString(
			save( {
				attributes: attrs( {
					headingLevel: 2,
					days: [ day( 'Day 1', 'A' ), day( 'Day 2', 'B' ) ],
				} ),
			} )
		);
		expect( named ).toContain(
			'<h2 class="tour-itinerary__day-title">Day 1</h2>'
		);
	} );

	it( 'escapes markup typed into fields', () => {
		const html = renderToString(
			save( {
				attributes: attrs( {
					days: [ day( '', '<img src=x onerror=alert(1)>' ) ],
				} ),
			} )
		);
		expect( html ).not.toContain( '<img' );
	} );
} );

describe( 'describeIssue', () => {
	it( 'names the day and stop in human terms', () => {
		expect(
			describeIssue( {
				path: 'days[1].stops[0].time',
				code: 'invalid_time',
			} )
		).toBe( 'Day 2, stop 1: Time must be a time such as 09:30' );
		expect(
			describeIssue( {
				path: 'offers.priceCurrency',
				code: 'invalid_currency',
			} )
		).toBe( 'Price: Currency must be a three-letter code such as EUR' );
	} );
} );

describe( 'clean', () => {
	it( 'leaves numbers and booleans alone', () => {
		expect( clean( { a: 1, b: true, c: [ 'x &amp; y' ] } ) ).toEqual( {
			a: 1,
			b: true,
			c: [ 'x & y' ],
		} );
	} );
} );
