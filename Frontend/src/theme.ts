import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
    initialColorMode: 'light',
    useSystemColorMode: false,
};

const theme = extendTheme({
    config,
    styles: {
        global: (props: any) => ({
            body: {
                bg: props.colorMode === 'dark' ? '#0f172a' : 'white',
                color: props.colorMode === 'dark' ? 'white' : 'gray.800',
            },
        }),
    },
    colors: {
        brand: {
            50: '#eef2ff',
            100: '#e0e7ff',
            200: '#c7d2fe',
            300: '#a5b4fc',
            400: '#818cf8',
            500: '#6366f1',
            600: '#4f46e5',
            700: '#4338ca',
            800: '#3730a3',
            900: '#312e81',
        },
    },
});

export default theme;
