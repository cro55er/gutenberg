/**
 * WordPress dependencies
 */
import { Popover } from '@wordpress/components';
import { PluginArea } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import WidgetAreasBlockEditorProvider from '../widget-areas-block-editor-provider';
import Sidebar from '../sidebar';
import Interface from './interface';
import UnsavedChangesWarning from './unsaved-changes-warning';

function Layout( { blockEditorSettings, isInCustomizer } ) {
	return (
		<WidgetAreasBlockEditorProvider
			blockEditorSettings={ blockEditorSettings }
		>
			<Interface
				blockEditorSettings={ blockEditorSettings }
				isInCustomizer={ isInCustomizer }
			/>
			<Sidebar isInCustomizer={ isInCustomizer } />
			<Popover.Slot />
			<PluginArea />
			<UnsavedChangesWarning />
		</WidgetAreasBlockEditorProvider>
	);
}

export default Layout;
