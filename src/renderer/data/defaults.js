export const defaultFileContentsByExtension = {
    html: `<!doctype html>
<html lang="{lang}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{document}</title>
    <link rel="icon" href="favicon.ico">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <main>
        <h1>{hello}</h1>
    </main>
    <script src="app.js"></script>
</body>
</html>
`,
    css: `body {
    margin: 0;
    font-family: Inter, system-ui, sans-serif;
}
`,
    js: `function main() {
    console.log('{hello_from}');
}

main();
`,
    mjs: `export function main() {
    console.log('{hello_from}');
}
`,
    ts: `function main(): void {
    console.log('{hello_from}');
}

main();
`,
    jsx: `export default function App() {
    return <h1>{hello}</h1>;
}
`,
    tsx: `export default function App() {
    return <h1>{hello}</h1>;
}
`,
    py: `def main():
    print("{hello_from}")


if __name__ == "__main__":
    main()
`,
    json: `{
  "name": "Tree IDE-project",
  "version": "1.0.0"
}
`,
    yml: `name: Tree IDE-project
`,
    yaml: `name: Tree IDE-project
`,
    sh: `#!/usr/bin/env sh

echo "{hello_from}"
`,
    bat: `@echo off
echo {hello_from}
`,
    ps1: `Write-Host "{hello_from}"
`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("{hello_from}");
    }
}
`,
    c: `#include <stdio.h>

int main(void) {
    printf("{hello_from}\\n");
    return 0;
}
`,
    cpp: `#include <iostream>

int main() {
    std::cout << "{hello_from}\\n";
    return 0;
}
`,
    go: `package main

import "fmt"

func main() {
    fmt.Println("{hello_from}")
}
`,
    rs: `fn main() {
    println!("{hello_from}");
}
`,
    php: `<?php

echo "{hello_from}";
`,
    rb: `def main
  puts "{hello_from}"
end

main
`,
    kt: `fun main() {
    println("{hello_from}")
}
`,
    swift: `import Foundation

print("{hello_from}")
`,
    dart: `void main() {
  print('{hello_from}');
}
`,
    scala: `object Main {
  def main(args: Array[String]): Unit = {
    println("{hello_from}")
  }
}
`,
    lua: `local function main()
    print("{hello_from}")
end

main()
`,
    r: `main <- function() {
  cat("{hello_from}\\n")
}

main()
`,
    zig: `const std = @import("std");

pub fn main() void {
    std.debug.print("{hello_from}\\n", .{});
}
`,
    ex: `defmodule Main do
  def run do
    IO.puts("{hello_from}")
  end
end

Main.run()
`,
    erl: `-module(main).
-export([start/0]).

start() ->
    io:format("{hello_from}~n").
`,
    clj: `(defn -main []
  (println "{hello_from}"))

(-main)
`,
    hs: `main :: IO ()
main = putStrLn "{hello_from}"
`,
    ml: `let () = print_endline "{hello_from}"
`,
    fs: `printfn "{hello_from}"
`,
    jl: `function main()
    println("{hello_from}")
end

main()
`,
    pl: `#!/usr/bin/perl
use strict;
use warnings;

print "{hello_from}\\n";
`,
    groovy: `println "{hello_from}"
`,
    sol: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Main {
    string public greeting = "{hello_from}";
}
`,
    proto: `syntax = "proto3";

message Hello {
  string message = 1;
}
`,
    tf: `# Terraform configuration

terraform {
  required_version = ">= 1.0"
}
`,
    fish: `#!/usr/bin/env fish

echo "{hello_from}"
`,
    scss: `$primary: #4f46e5;

body {
  font-family: system-ui, sans-serif;
  color: $primary;
}
`,
    vue: `<template>
  <div>{{ message }}</div>
</template>

<script setup>
const message = "{hello_from}";
</script>
`,
    svelte: `<script>
  let message = "{hello_from}";
</script>

<div>{message}</div>
`,
    astro: `---
const message = "{hello_from}";
---

<div>{message}</div>
`,
    pug: `doctype html
html
  head
    title Tree IDE
  body
    h1 {hello}
`,
    ejs: `<%- include('partials/header') %>
<h1>{hello}</h1>
<%- include('partials/footer') %>
`,
    hbs: `<h1>{hello}</h1>
`,
    liquid: `<h1>{hello}</h1>
`,
    prisma: `model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
`,
    graphql: `type Query {
  hello: String
}
`,
    sql: `-- Tree IDE SQL

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);
`,
    jsonc: `{
  // Tree IDE configuration
  "name": "project",
  "version": "1.0.0"
}
`,
    json5: `{
  // Tree IDE configuration
  name: "project",
  version: "1.0.0",
}
`,
    toml: `# Tree IDE configuration
[project]
name = "project"
version = "1.0.0"
`,
    ini: `; Tree IDE configuration
[project]
name = project
version = 1.0.0
`,
    cmake: `cmake_minimum_required(VERSION 3.10)
project(TreeIDEProject)

message("{hello_from}")
`,
    nginx: `server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
}
`,
    docker_compose: `version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    environment:
      - NODE_ENV=development
`,
    dockerfile: `FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "src/index.js"]
`,
    makefile: `.PHONY: build run clean

build:
\t@echo "Building..."

run:
\t@echo "Running..."

clean:
\t@echo "Cleaning..."
`
};
