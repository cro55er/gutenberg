/**
 * Internal dependencies
 */
import { withNext } from '../ui/context';
import { FontSizeControl } from '../ui/font-size-control';

const FontSizePicker = ( props, ref ) => {
	// @todo Wrapped with div.components-base-control for spacing reasons.
	// Remove this when the inner Typography Tools component uses VStack
	// to automatically space elements apart vertically.
	return (
		<div className="components-base-control">
			<FontSizeControl { ...props } { ...( ref ? {} : { ref } ) } />
		</div>
	);
};

export function withNextComponent( current ) {
	return withNext( current, FontSizePicker, 'WPComponentsFontSizePicker' );
}