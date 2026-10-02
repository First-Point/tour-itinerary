import { __, sprintf } from '@wordpress/i18n';
import {
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	store as blockEditorStore,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	Button,
	Notice,
	PanelBody,
	SelectControl,
	TextControl,
	TextareaControl,
	ToggleControl,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useMemo } from '@wordpress/element';
import { tryBuildTouristTrip } from 'tourist-trip-schema';
import { clean, emptyDay, emptyStop, toTripInput, visibleDays } from './data';
import { describeIssue } from './issues';
import Timeline from './timeline';

const FIELD = { __next40pxDefaultSize: true, __nextHasNoMarginBottom: true };

/** Post title of the post being edited, or '' outside the post editor. */
function usePostTitle() {
	return useSelect( ( select ) => {
		try {
			const editor = select( 'core/editor' );
			return editor?.getEditedPostAttribute?.( 'title' ) || '';
		} catch {
			return '';
		}
	}, [] );
}

function StopEditor( {
	stop,
	dayIndex,
	stopIndex,
	count,
	onChange,
	onMove,
	onRemove,
} ) {
	const set = ( key ) => ( value ) => onChange( { ...stop, [ key ]: value } );
	return (
		<fieldset className="tour-itinerary-editor__stop">
			<legend className="tour-itinerary-editor__legend">
				{ sprintf(
					/* translators: 1: day number, 2: stop number */
					__( 'Day %1$d, stop %2$d', 'tour-itinerary' ),
					dayIndex + 1,
					stopIndex + 1
				) }
			</legend>
			<div className="tour-itinerary-editor__row">
				<TextControl
					{ ...FIELD }
					type="time"
					label={ __( 'Time', 'tour-itinerary' ) }
					value={ stop.time }
					onChange={ set( 'time' ) }
				/>
				<TextControl
					{ ...FIELD }
					label={ __( 'Name', 'tour-itinerary' ) }
					value={ stop.name }
					onChange={ set( 'name' ) }
				/>
			</div>
			<TextareaControl
				__nextHasNoMarginBottom
				label={ __( 'Description', 'tour-itinerary' ) }
				value={ stop.description }
				onChange={ set( 'description' ) }
				rows={ 2 }
			/>
			<TextControl
				{ ...FIELD }
				label={ __( 'Address', 'tour-itinerary' ) }
				value={ stop.address }
				onChange={ set( 'address' ) }
			/>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __(
					'Not a sight (meal, meeting point, transfer)',
					'tour-itinerary'
				) }
				checked={ !! stop.isPlace }
				onChange={ set( 'isPlace' ) }
			/>
			<div className="tour-itinerary-editor__actions">
				<Button
					size="small"
					variant="tertiary"
					disabled={ stopIndex === 0 }
					onClick={ () => onMove( -1 ) }
				>
					{ __( 'Move up', 'tour-itinerary' ) }
				</Button>
				<Button
					size="small"
					variant="tertiary"
					disabled={ stopIndex === count - 1 }
					onClick={ () => onMove( 1 ) }
				>
					{ __( 'Move down', 'tour-itinerary' ) }
				</Button>
				<Button
					size="small"
					variant="tertiary"
					isDestructive
					onClick={ onRemove }
				>
					{ __( 'Remove stop', 'tour-itinerary' ) }
				</Button>
			</div>
		</fieldset>
	);
}

function move( list, index, delta ) {
	const next = [ ...list ];
	const [ item ] = next.splice( index, 1 );
	next.splice( index + delta, 0, item );
	return next;
}

export default function Edit( { attributes, setAttributes, isSelected } ) {
	const a = clean( attributes );
	const days =
		Array.isArray( a.days ) && a.days.length > 0 ? a.days : [ emptyDay() ];
	const postTitle = usePostTitle();
	const blockProps = useBlockProps();
	const { __unstableMarkNextChangeAsNotPersistent: markNotPersistent } =
		useDispatch( blockEditorStore );

	const result = useMemo(
		() => tryBuildTouristTrip( toTripInput( attributes, postTitle ) ),
		[ attributes, postTitle ]
	);

	// Keep the stored structured data in sync with the inputs. render.php
	// prints it; nothing is computed on the server. Marked as not
	// persistent so it does not create its own undo step.
	const nextSchema = result.ok ? JSON.stringify( result.data ) : '';
	const storedSchema = attributes.schema
		? JSON.stringify( clean( attributes.schema ) )
		: '';
	useEffect( () => {
		if ( nextSchema === storedSchema ) {
			return;
		}
		markNotPersistent?.();
		setAttributes( { schema: result.ok ? result.data : undefined } );
	}, [ nextSchema, storedSchema ] ); // eslint-disable-line react-hooks/exhaustive-deps

	const setDays = ( next ) => setAttributes( { days: next } );
	const setDay = ( index, day ) =>
		setDays( days.map( ( d, i ) => ( i === index ? day : d ) ) );

	const inspector = (
		<InspectorControls>
			<PanelBody title={ __( 'Trip', 'tour-itinerary' ) }>
				<TextControl
					{ ...FIELD }
					label={ __( 'Trip name', 'tour-itinerary' ) }
					help={ __(
						'Leave empty to use the page title.',
						'tour-itinerary'
					) }
					placeholder={ postTitle }
					value={ a.name }
					onChange={ ( name ) => setAttributes( { name } ) }
				/>
				<TextareaControl
					__nextHasNoMarginBottom
					label={ __( 'Short description', 'tour-itinerary' ) }
					value={ a.description }
					onChange={ ( description ) =>
						setAttributes( { description } )
					}
				/>
				<MediaUploadCheck>
					<MediaUpload
						allowedTypes={ [ 'image' ] }
						onSelect={ ( media ) =>
							setAttributes( { image: media?.url || '' } )
						}
						render={ ( { open } ) => (
							<div className="tour-itinerary-editor__image">
								{ a.image && <img src={ a.image } alt="" /> }
								<Button variant="secondary" onClick={ open }>
									{ a.image
										? __(
												'Replace image',
												'tour-itinerary'
											)
										: __(
												'Choose image',
												'tour-itinerary'
											) }
								</Button>
								{ a.image && (
									<Button
										variant="tertiary"
										isDestructive
										onClick={ () =>
											setAttributes( { image: '' } )
										}
									>
										{ __(
											'Remove image',
											'tour-itinerary'
										) }
									</Button>
								) }
							</div>
						) }
					/>
				</MediaUploadCheck>
				<p className="tour-itinerary-editor__hint">
					{ __(
						'Without an image, the featured image is used.',
						'tour-itinerary'
					) }
				</p>
				<TextControl
					{ ...FIELD }
					label={ __( 'Audience', 'tour-itinerary' ) }
					help={ __(
						'Comma-separated, for example: Families, History enthusiasts',
						'tour-itinerary'
					) }
					value={ a.audience }
					onChange={ ( audience ) => setAttributes( { audience } ) }
				/>
			</PanelBody>
			<PanelBody
				title={ __( 'Organizer', 'tour-itinerary' ) }
				initialOpen={ false }
			>
				<TextControl
					{ ...FIELD }
					label={ __( 'Company or guide name', 'tour-itinerary' ) }
					value={ a.providerName }
					onChange={ ( providerName ) =>
						setAttributes( { providerName } )
					}
				/>
				<TextControl
					{ ...FIELD }
					type="url"
					label={ __( 'Website', 'tour-itinerary' ) }
					value={ a.providerUrl }
					onChange={ ( providerUrl ) =>
						setAttributes( { providerUrl } )
					}
				/>
			</PanelBody>
			<PanelBody
				title={ __( 'Price', 'tour-itinerary' ) }
				initialOpen={ false }
			>
				<TextControl
					{ ...FIELD }
					type="number"
					min={ 0 }
					step="0.01"
					label={ __( 'Price per person', 'tour-itinerary' ) }
					value={ a.price }
					onChange={ ( price ) => setAttributes( { price } ) }
				/>
				<TextControl
					{ ...FIELD }
					label={ __( 'Currency', 'tour-itinerary' ) }
					help={ __(
						'Three-letter code, for example EUR, USD, TRY.',
						'tour-itinerary'
					) }
					maxLength={ 3 }
					value={ a.currency }
					onChange={ ( currency ) =>
						setAttributes( { currency: currency.toUpperCase() } )
					}
				/>
			</PanelBody>
			<PanelBody
				title={ __( 'Display', 'tour-itinerary' ) }
				initialOpen={ false }
			>
				<SelectControl
					{ ...FIELD }
					label={ __( 'Day heading level', 'tour-itinerary' ) }
					value={ String( a.headingLevel ) }
					options={ [ 2, 3, 4, 5, 6 ].map( ( n ) => ( {
						label: `H${ n }`,
						value: String( n ),
					} ) ) }
					onChange={ ( value ) =>
						setAttributes( { headingLevel: Number( value ) } )
					}
				/>
			</PanelBody>
			<PanelBody
				title={ __( 'Structured data', 'tour-itinerary' ) }
				initialOpen={ false }
			>
				{ result.ok ? (
					<>
						<p>
							{ __(
								'This schema.org TouristTrip data is added to the page. The page address and, if no image is set, the featured image are added when the page is shown.',
								'tour-itinerary'
							) }
						</p>
						<pre className="tour-itinerary-editor__json">
							{ JSON.stringify( result.data, null, 2 ) }
						</pre>
					</>
				) : (
					<p>
						{ __(
							'No structured data is added until the problems above are fixed.',
							'tour-itinerary'
						) }
					</p>
				) }
			</PanelBody>
		</InspectorControls>
	);

	const issues = result.ok ? [] : result.issues;

	return (
		<div { ...blockProps }>
			{ inspector }
			{ isSelected && issues.length > 0 && (
				<Notice
					status="warning"
					isDismissible={ false }
					className="tour-itinerary-editor__notice"
				>
					<p>
						{ __(
							'Structured data is not added to the page until these are fixed:',
							'tour-itinerary'
						) }
					</p>
					<ul>
						{ issues.map( ( issue ) => (
							<li key={ issue.path + issue.code }>
								{ describeIssue( issue ) }
							</li>
						) ) }
					</ul>
				</Notice>
			) }
			{ ! isSelected && visibleDays( a.days ).length === 0 && (
				<p className="tour-itinerary-editor__placeholder">
					{ __(
						'Tour itinerary: select this block to add days and stops.',
						'tour-itinerary'
					) }
				</p>
			) }
			{ ! isSelected && (
				<Timeline days={ a.days } headingLevel={ a.headingLevel } />
			) }
			{ isSelected && (
				<div className="tour-itinerary-editor">
					{ days.map( ( day, dayIndex ) => (
						<section
							className="tour-itinerary-editor__day"
							key={ dayIndex }
						>
							<div className="tour-itinerary-editor__row">
								<TextControl
									{ ...FIELD }
									label={ sprintf(
										/* translators: %d: day number */
										__(
											'Day %d title (optional)',
											'tour-itinerary'
										),
										dayIndex + 1
									) }
									value={ day.name }
									onChange={ ( name ) =>
										setDay( dayIndex, { ...day, name } )
									}
								/>
							</div>
							<TextareaControl
								__nextHasNoMarginBottom
								label={ __(
									'Day description (optional)',
									'tour-itinerary'
								) }
								value={ day.description }
								rows={ 2 }
								onChange={ ( description ) =>
									setDay( dayIndex, { ...day, description } )
								}
							/>
							{ ( day.stops || [] ).map( ( stop, stopIndex ) => (
								<StopEditor
									key={ stopIndex }
									stop={ stop }
									dayIndex={ dayIndex }
									stopIndex={ stopIndex }
									count={ day.stops.length }
									onChange={ ( next ) =>
										setDay( dayIndex, {
											...day,
											stops: day.stops.map( ( s, i ) =>
												i === stopIndex ? next : s
											),
										} )
									}
									onMove={ ( delta ) =>
										setDay( dayIndex, {
											...day,
											stops: move(
												day.stops,
												stopIndex,
												delta
											),
										} )
									}
									onRemove={ () =>
										setDay( dayIndex, {
											...day,
											stops: day.stops.filter(
												( _, i ) => i !== stopIndex
											),
										} )
									}
								/>
							) ) }
							<div className="tour-itinerary-editor__actions">
								<Button
									variant="secondary"
									onClick={ () =>
										setDay( dayIndex, {
											...day,
											stops: [
												...( day.stops || [] ),
												emptyStop(),
											],
										} )
									}
								>
									{ __( 'Add stop', 'tour-itinerary' ) }
								</Button>
								{ days.length > 1 && (
									<Button
										variant="tertiary"
										isDestructive
										onClick={ () =>
											setDays(
												days.filter(
													( _, i ) => i !== dayIndex
												)
											)
										}
									>
										{ __( 'Remove day', 'tour-itinerary' ) }
									</Button>
								) }
							</div>
						</section>
					) ) }
					<Button
						variant="primary"
						onClick={ () => setDays( [ ...days, emptyDay() ] ) }
					>
						{ __( 'Add day', 'tour-itinerary' ) }
					</Button>
				</div>
			) }
		</div>
	);
}
