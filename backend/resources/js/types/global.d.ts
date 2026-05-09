import type { route as routeFn } from 'ziggy-js';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { PageProps as AppPageProps } from './';

declare global {
    const route: typeof routeFn;
}

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps, AppPageProps {}
}