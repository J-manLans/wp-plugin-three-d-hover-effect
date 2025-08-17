<?php
/**
 * Plugin Name: 3D Hover Effect
 * Description: Adds a 3D hover effect to blocks in Gutenberg.
 * Version:     1.0.0
 * Author:      Joel Lansgren
 */

// Abort if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Load Gutenberg editor dependencies
add_action('enqueue_block_editor_assets', function() {
    wp_enqueue_script(
        'three-d-hover-effect-editor',
        plugin_dir_url( __FILE__ ) . 'editor/index.js',
        [
            'wp-element',
            'wp-components',
            'wp-block-editor',
            'wp-hooks'
        ],
        filemtime( plugin_dir_path( __FILE__ ) . 'editor/index.js' )
    );
});

// Load frontend dependencies
add_action('wp_enqueue_scripts', function() {
    wp_enqueue_script(
        'three-d-hover-effect-frontend',
        plugin_dir_url( __FILE__ ) . 'public/three-d-hover-effect-frontend.js',
        [],
        filemtime( plugin_dir_path( __FILE__ ) . 'public/three-d-hover-effect-frontend.js' ),
        true
    );
});
