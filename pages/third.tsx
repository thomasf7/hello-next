interface Props {
    value: string
}
const Third = (props: Props) => {
     return (
        <>
            <h1>This is a functional page that doesn't talk to cosmos</h1>
            <div>A random value is {props.value}</div>
            <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
            <br />
            <ul>
                <li><a href="/">Go home</a></li>
                <li><a href="/second">Go to the second page</a></li>
                <li><a href="/staticpage">Go to the static page</a></li>
            </ul>
        </>
    );
}

Third.getInitialProps = async function() {
    return { value: Math.floor(Math.random() * 1000).toString()};
}

export default Third;