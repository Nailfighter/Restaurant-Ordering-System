// Modify your layout / template file as follows to center login form across the screen

// <html className"h-full"/>
// <body className"h-full"/>

// 'use client';

import { Card, Divider, TextInput } from "@tremor/react";

export default function Credentials() {
  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <Card className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h3 className="text-center text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            Log in
          </h3>
          <form action="#" method="post" className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
              >
                Email
              </label>
              <TextInput
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                placeholder="john@company.com"
                className="mt-2"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
              >
                Password
              </label>
              <TextInput
                type="password"
                id="password"
                name="password"
                autoComplete="password"
                placeholder="password"
                className="mt-2"
              />
            </div>
            <button
              type="submit"
              className="mt-4 w-full whitespace-nowrap rounded-tremor-default bg-tremor-brand py-2 text-center text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis dark:bg-dark-tremor-brand dark:text-dark-tremor-brand-inverted dark:shadow-dark-tremor-input dark:hover:bg-dark-tremor-brand-emphasis"
            >
              Sign in
            </button>
          </form>
        </Card>
      </div>
    </>
  );
}
