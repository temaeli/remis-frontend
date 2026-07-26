import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { RetryLink } from '@apollo/client/link/retry';
import { environment } from '@env/environment';
import { map } from 'rxjs';
import { inject } from '@angular/core';

const GRAPHQL_URI = `${environment.SERVER_URL}/graphql`;

export function createApollo() {
  const httpLink = inject(HttpLink);
  const http = httpLink.create({ uri: GRAPHQL_URI });

  // handled by Token Interceptor
  const authLink = new ApolloLink((operation, forward) => {
    operation.setContext({ headers: {} as any });
    return forward(operation);
  });

  const errorLink = new ApolloLink((operation, forward) => {
    return forward(operation).pipe(
      map((response) => {
        if (response.errors) {
          for (const err of response.errors) {
            console.error('[GraphQL error]', err.message);
          }
        }

        return response;
      }),
    );
  });

  const retryLink = new RetryLink({
    attempts: { max: 2 },
    delay: { initial: 300, max: 2000, jitter: true },
  });

  return {
    link: retryLink.concat(errorLink).concat(authLink).concat(http),
    cache: new InMemoryCache(({ addTypename: false } as any)),
    connectToDevTools: !environment.production,
  };
}
