const StaticPage = () => {
    return (
        <>
            <h1>Hello - this is a static page</h1>
            <br />
            <img src="coffee.jpg"></img>
            <br />
            <ul>
                <li><a href="/">Go home</a></li>
                <li><a href="/second">Go to the second page</a></li>
                <li><a href="/third">Go to the third page</a></li>
            </ul>
        </>
    );
};

export default StaticPage;
