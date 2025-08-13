(function (wp) {
    const { addFilter } = wp.hooks;
    const { createElement, Fragment } = wp.element;
    const { InspectorControls } = wp.blockEditor || wp.editor;
    const { PanelBody, ToggleControl, RangeControl } = wp.components;

    // Register new attribute for all blocks
    addFilter('blocks.registerBlockType', 'three-d-hover-effect/attributes', function (settings) {
        if (typeof settings.attributes !== 'undefined') {
            settings.attributes = Object.assign({}, settings.attributes, {
                threeD: { type: 'boolean', default: false },
                threeDPerspective: { type: 'number', default: 1000 },
                threeDMaxRotate: { type: 'number', default: 2 }
            });
        }
        return settings;
    });

    // Add controller in the Gutenberg editor sidepanel
    addFilter('editor.BlockEdit', 'three-d-hover-effect/inspector-controls', function (BlockEdit) {
        return function (props) {
            const { attributes, setAttributes, isSelected } = props;
            const {threeD, threeDPerspective, threeDMaxRotate} = attributes;

            const controls = isSelected
                ? createElement(
                    InspectorControls,
                    {},
                    createElement(PanelBody, { title: '3D Hover Effect', initialOpen: false },
                        createElement(ToggleControl, {
                            label: 'Enable 3D Hover Effect',
                            checked: threeD,
                            onChange: (value) => setAttributes({ threeD: value }),
                        }),
                        threeD && createElement(
                            Fragment, {},
                            createElement(RangeControl, {
                                label: 'Perspective',
                                value: threeDPerspective,
                                min: 500,
                                max: 2000,
                                step: 500,
                                onChange: (value) => setAttributes({ threeDPerspective: value }),
                            }),
                            createElement(RangeControl, {
                                label: 'Max Rotation On Element',
                                value: threeDMaxRotate,
                                min: 1,
                                max: 10,
                                step: 0.5,
                                onChange: (value) => setAttributes({ threeDMaxRotate: value }),
                            })
                        )
                    )
                ) : null;

            return createElement(Fragment, {}, createElement(BlockEdit, props), controls);
        };
    });

    // Add wrapper-attribut (data-* and class)
    addFilter(
        'blocks.getSaveContent.extraProps',
        'three-d-hover-effect/wrapper-props',
        function (props, blockType, attributes) {
            const {threeD, threeDPerspective, threeDMaxRotate} = attributes;

            if (threeD) {
                // Add data-attributes
                props['data-three-d'] = true;
                props['data-three-d-perspective'] = threeDPerspective;
                props['data-three-d-max-rotate'] = threeDMaxRotate;

                // Add css class
                const classToAdd = 'card-3d';
                const existing = props.className || '';
                const classes = existing.split(/\s+/).filter(Boolean);
                if (!classes.includes(classToAdd)) classes.push(classToAdd);
                props.className = classes.join(' ');
            }
            return props;
        }
    );
})(window.wp);
