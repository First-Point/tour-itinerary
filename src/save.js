import { useBlockProps } from '@wordpress/block-editor';
import { clean } from './data';
import Timeline from './timeline';

export default function save( { attributes } ) {
	const { days, headingLevel } = clean( attributes );
	return (
		<div { ...useBlockProps.save() }>
			<Timeline days={ days } headingLevel={ headingLevel } />
		</div>
	);
}
