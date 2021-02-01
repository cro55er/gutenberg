/**
 * WordPress dependencies
 */
import { useEffect, useState, useMemo, useCallback } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	SlotFillProvider,
	DropZoneProvider,
	Popover,
	Button,
} from '@wordpress/components';
import { EntityProvider } from '@wordpress/core-data';
import { BlockContextProvider, BlockBreadcrumb } from '@wordpress/block-editor';
import {
	FullscreenMode,
	InterfaceSkeleton,
	ComplementaryArea,
	store as interfaceStore,
} from '@wordpress/interface';
import { EntitiesSavedStates, UnsavedChangesWarning } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { PluginArea } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import Notices from '../notices';
import Header from '../header';
import { SidebarComplementaryAreaFills } from '../sidebar';
import BlockEditor from '../block-editor';
import KeyboardShortcuts from '../keyboard-shortcuts';
import GlobalStylesProvider from './global-styles-provider';
import NavigationSidebar from '../navigation-sidebar';
import URLQueryController from '../url-query-controller';
import InserterSidebar from '../secondary-sidebar/inserter-sidebar';
import BlockNavigationSidebar from '../secondary-sidebar/block-navigation-sidebar';
import { store as editSiteStore } from '../../store';

const interfaceLabels = {
	secondarySidebar: __( 'Block Library' ),
	drawer: __( 'Navigation Sidebar' ),
};

function Editor() {
	const {
		isFullscreenActive,
		isInserterOpen,
		sidebarIsOpened,
		settings,
		entityId,
		templateType,
		page,
		template,
		isNavigationOpen,
		isBlockNavigationOpen,
	} = useSelect( ( select ) => {
		const {
			isFeatureActive,
			isInserterOpened,
			getSettings,
			getEditedPostType,
			getEditedPostId,
			getPage,
			isNavigationOpened,
			isBlockNavigationOpened,
		} = select( editSiteStore );
		const postType = getEditedPostType();
		const postId = getEditedPostId();

		// The currently selected entity to display. Typically template or template part.
		return {
			isInserterOpen: isInserterOpened(),
			isFullscreenActive: isFeatureActive( 'fullscreenMode' ),
			sidebarIsOpened: !! select(
				interfaceStore
			).getActiveComplementaryArea( editSiteStore.name ),
			settings: getSettings(),
			templateType: postType,
			page: getPage(),
			template: postId
				? select( 'core' ).getEntityRecord(
						'postType',
						postType,
						postId
				  )
				: null,
			entityId: postId,
			isNavigationOpen: isNavigationOpened(),
			isBlockNavigationOpen: isBlockNavigationOpened(),
		};
	}, [] );
	const { updateEditorSettings } = useDispatch( 'core/editor' );
	const { setPage, setIsInserterOpened } = useDispatch( editSiteStore );

	// Keep the defaultTemplateTypes in the core/editor settings too,
	// so that they can be selected with core/editor selectors in any editor.
	// This is needed because edit-site doesn't initialize with EditorProvider,
	// which internally uses updateEditorSettings as well.
	const { defaultTemplateTypes } = settings;
	useEffect( () => {
		updateEditorSettings( { defaultTemplateTypes } );
	}, [ defaultTemplateTypes ] );

	const [
		isEntitiesSavedStatesOpen,
		setIsEntitiesSavedStatesOpen,
	] = useState( false );
	const openEntitiesSavedStates = useCallback(
		() => setIsEntitiesSavedStatesOpen( true ),
		[]
	);
	const closeEntitiesSavedStates = useCallback( () => {
		setIsEntitiesSavedStatesOpen( false );
	}, [] );

	const blockContext = useMemo(
		() => ( {
			...page?.context,
			queryContext: [
				page?.context.queryContext || { page: 1 },
				( newQueryContext ) =>
					setPage( {
						...page,
						context: {
							...page?.context,
							queryContext: {
								...page?.context.queryContext,
								...newQueryContext,
							},
						},
					} ),
			],
		} ),
		[ page?.context ]
	);

	useEffect( () => {
		if ( isNavigationOpen ) {
			document.body.classList.add( 'is-navigation-sidebar-open' );
		} else {
			document.body.classList.remove( 'is-navigation-sidebar-open' );
		}
	}, [ isNavigationOpen ] );

	return (
		<>
			<URLQueryController />
			<FullscreenMode isActive={ isFullscreenActive } />
			<UnsavedChangesWarning />
			<SlotFillProvider>
				<DropZoneProvider>
					<EntityProvider kind="root" type="site">
						<EntityProvider
							kind="postType"
							type={ templateType }
							id={ entityId }
						>
							<EntityProvider
								kind="postType"
								type="wp_global_styles"
								id={
									settings.__experimentalGlobalStylesUserEntityId
								}
							>
								<BlockContextProvider value={ blockContext }>
									<GlobalStylesProvider
										baseStyles={
											settings.__experimentalGlobalStylesBaseStyles
										}
									>
										<KeyboardShortcuts.Register />
										<SidebarComplementaryAreaFills />
										<InterfaceSkeleton
											labels={ interfaceLabels }
											drawer={ <NavigationSidebar /> }
											secondarySidebar={
												<>
													{ isInserterOpen && (
														<InserterSidebar />
													) }
													{ isBlockNavigationOpen && (
														<BlockNavigationSidebar />
													) }
												</>
											}
											sidebar={
												sidebarIsOpened && (
													<ComplementaryArea.Slot scope="core/edit-site" />
												)
											}
											header={
												<Header
													openEntitiesSavedStates={
														openEntitiesSavedStates
													}
												/>
											}
											content={
												<>
													<Notices />
													{ template && (
														<BlockEditor
															setIsInserterOpen={
																setIsInserterOpened
															}
														/>
													) }
													<KeyboardShortcuts />
												</>
											}
											actions={
												<>
													<EntitiesSavedStates
														isOpen={
															isEntitiesSavedStatesOpen
														}
														close={
															closeEntitiesSavedStates
														}
													/>
													{ ! isEntitiesSavedStatesOpen && (
														<div className="edit-site-editor__toggle-save-panel">
															<Button
																isSecondary
																className="edit-site-editor__toggle-save-panel-button"
																onClick={
																	openEntitiesSavedStates
																}
																aria-expanded={
																	false
																}
															>
																{ __(
																	'Open save panel'
																) }
															</Button>
														</div>
													) }
												</>
											}
											footer={ <BlockBreadcrumb /> }
										/>
										<Popover.Slot />
										<PluginArea />
									</GlobalStylesProvider>
								</BlockContextProvider>
							</EntityProvider>
						</EntityProvider>
					</EntityProvider>
				</DropZoneProvider>
			</SlotFillProvider>
		</>
	);
}
export default Editor;
