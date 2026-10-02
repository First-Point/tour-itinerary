/**
 * The visible itinerary. Used by `save()` and by the editor preview, so the
 * two can never drift apart. Expects cleaned attributes (see data.js).
 */
import { visibleDays } from './data';

function Stops( { stops } ) {
	return (
		<ol className="tour-itinerary__stops">
			{ stops.map( ( stop, index ) => (
				<li className="tour-itinerary__stop" key={ index }>
					{ stop.time && (
						<time
							className="tour-itinerary__time"
							dateTime={ stop.time }
						>
							{ stop.time }
						</time>
					) }
					<div className="tour-itinerary__body">
						<span className="tour-itinerary__name">
							{ stop.name }
						</span>
						{ stop.description && (
							<p className="tour-itinerary__description">
								{ stop.description }
							</p>
						) }
						{ stop.address && (
							<span className="tour-itinerary__address">
								{ stop.address }
							</span>
						) }
					</div>
				</li>
			) ) }
		</ol>
	);
}

export default function Timeline( { days, headingLevel } ) {
	const shown = visibleDays( days );
	if ( shown.length === 0 ) {
		return null;
	}

	// One untitled day: a plain list of stops, no day headings.
	const only = shown[ 0 ];
	if ( shown.length === 1 && ! only.name && ! only.description ) {
		return <Stops stops={ only.stops } />;
	}

	const level = [ 2, 3, 4, 5, 6 ].includes( headingLevel ) ? headingLevel : 3;
	const Heading = `h${ level }`;
	return (
		<ol className="tour-itinerary__days">
			{ shown.map( ( day, index ) => (
				<li className="tour-itinerary__day" key={ index }>
					{ day.name && (
						<Heading className="tour-itinerary__day-title">
							{ day.name }
						</Heading>
					) }
					{ day.description && (
						<p className="tour-itinerary__day-description">
							{ day.description }
						</p>
					) }
					{ day.stops.length > 0 && <Stops stops={ day.stops } /> }
				</li>
			) ) }
		</ol>
	);
}
