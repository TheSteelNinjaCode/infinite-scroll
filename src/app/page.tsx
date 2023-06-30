"use client"

import { useIntersection } from "@mantine/hooks"
import { User } from "@prisma/client"
import { QueryClient, QueryClientProvider, useInfiniteQuery } from "@tanstack/react-query"
import React, { useEffect, useRef } from "react"

function Projects() {
  const fetchProjects = async ({ pageParam = 1 }) => {
    const res = await fetch('/api/user?cursor=' + pageParam)
    return res.json()
  }

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const containerRef = useRef();
  const { ref, entry } = useIntersection({
    root: containerRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry && entry.isIntersecting && hasNextPage) {
      console.log("entry: ", entry)
      fetchNextPage();
    }
  }, [entry, fetchNextPage, hasNextPage])

  const users = data?.pages.flatMap(page => page.users) ?? []

  if (users.length === 0) return <p>No users</p>

  console.log("data: ", data)

  return status === 'loading' ? (
    <p>Loading...</p>
  ) : status === 'error' ? (
    <p>Error: {error as string}</p>
  ) : (
    <div ref={ref}>
      {users.map((user: User, idx: number) => {
        idx++;
        if (users.length === idx) {
          return <div ref={ref} key={user.id}>{idx} - {user.first_name}</div>
        }
        return (
          <p key={user.id}>{idx} - {user.first_name}</p>
        )
      })}
      <div>
        <button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage
            ? 'Loading more...'
            : hasNextPage
              ? 'Load More'
              : 'Nothing more to load'}
        </button>
      </div>
      <div>{isFetching && !isFetchingNextPage ? 'Fetching...' : null}</div>
    </div>
  )
}

export default function Home() {

  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <Projects />
    </QueryClientProvider>
  )
}

