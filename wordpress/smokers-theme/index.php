<?php
defined('ABSPATH') || exit;
if (!function_exists('smokers_render_page')) {
    wp_die(esc_html__('Activate the Smokers Content plugin to display this theme.', 'smokers'));
}
smokers_render_page();
