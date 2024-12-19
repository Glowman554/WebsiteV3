import Navigation, { Entry, Home } from '@glowman554/base-components/src/generic/Navigation';

export default function () {
    return (
        <Navigation>
            <Home href="/">Home</Home>
            <Entry href="/about">About me</Entry>
            <Entry href="/blog">Blog</Entry>
            <Entry href="/projects">Projects</Entry>
            <Entry href="/contact">Contact me</Entry>
            <Entry href="/downloads">Downloads</Entry>
            <Entry href="https://github.com/Glowman554">GitHub</Entry>
        </Navigation>
    );
}
