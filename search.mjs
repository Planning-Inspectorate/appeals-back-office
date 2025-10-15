import {
    SearchClient,
    AzureKeyCredential,
} from "@azure/search-documents";


import dotenv from 'dotenv';
dotenv.config();

// this uses api keys for simplicity, but we should use RBAC/Identity in production
// import { DefaultAzureCredential } from '@azure/identity'; new DefaultAzureCredential() // instead of new AzureKeyCredential(apiKey)

const endpoint = process.env.SEARCH_ENDPOINT; // uri of search service in azure
const apiKey = process.env.SEARCH_API_KEY; // query api key - settings/keys
const adminApiKey = process.env.SEARCH_ADMIN_API_KEY; // admin api key - settings/keys
const indexName = 'test-blob'; // name of index, we specify this on creation
const exampleDocumentUri = process.env.DOCUMENT_URI; // a blob uri, used for the id of the document in the index we can update

if (!endpoint || !apiKey || !adminApiKey || !exampleDocumentUri) {
    throw new Error("Missing required environment variables.");
}

const searchIndex = async () => {
    const searchClient = new SearchClient(
        endpoint,
        indexName,
        new AzureKeyCredential(apiKey),
    );

    const searchResults = await searchClient.search("boom", {
        searchFields: ["content"],
        searchMode: "all",
        filter: `date lt ${new Date().toISOString()}`,
        orderBy: ["date desc"],
        select: ["id", "date", "caseReference"],
        includeTotalCount: true
    });

    console.log(searchResults);

    for await (const result of searchResults.results) {
        console.log(result);
    }
};

const updateBlobIndex = async () => {
    const updateClient = new SearchClient(
        endpoint,
        indexName,
        new AzureKeyCredential(adminApiKey),
    );

    const mapDocUriToIndexId = (uri) => {
        // base64 no padding
        return btoa(uri).replace(/=+$/, '');
    }

    await updateClient.mergeDocuments([
        {
            id: mapDocUriToIndexId(exampleDocumentUri),
            caseReference: '6000000',
            date: new Date()
        }
    ]);
}

searchIndex();
updateBlobIndex();
