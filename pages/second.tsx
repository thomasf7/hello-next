import config from "../config";
const CosmosClient = require('@azure/cosmos').CosmosClient;

interface Props {
    names: string[]
}
const Second = (props: Props) => {
     return (
        <>
            <h1>Another Page!</h1>
            <h2>Names in database:</h2>
            {props.names ? props.names.map(name => <div key={name}>{name}</div>) : <div>unknown</div>}
            {props.names && props.names.length === 0 && <div>database is empty</div>}
            <br />
            <ul>
                <li><a href="/">Go home</a></li>
                <li><a href="/third">Go to the third page</a></li>
                <li><a href="/staticpage">Go to the static page</a></li>
            </ul>
        </>
    );
}

Second.getInitialProps = async function() {
    const {endpoint, key, database, container } = config;

    if(endpoint) {
        const client = new CosmosClient({ endpoint, key });
        console.log(`Querying container:\n${container}`)
        const querySpec = {
            query: 'SELECT VALUE r.name FROM root r'
        }

        const { resources: results } = await client
            .database(database)
            .container(container)
            .items.query(querySpec)
            .fetchAll();

        const names = [];
        for (var queryResult of results) {
            let resultString = JSON.stringify(queryResult);
            console.log(`\tQuery returned ${resultString}\n`);
            names.push(queryResult);
        }
        return { names };
    }
    console.log("endpoint is not configured returning empty");
    return { names: []};
}

export default Second;