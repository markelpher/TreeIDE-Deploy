/**
 * TreeIDE - native project templates
 */

export const nativeTemplates = {
    c: {
    label: `C`,
    tree: `c-app/
    src/
        main.c
    include/
        app.h
    Makefile
    README.md
    .gitignore`,
    files: {
        "c-app/include/app.h": `#ifndef APP_H
#define APP_H

void run_app(void);

#endif
`,
        "c-app/src/main.c": `#include <stdio.h>
#include "app.h"

void run_app(void) {
    puts("Hello from C");
}

int main(void) {
    run_app();
    return 0;
}
`,
        "c-app/Makefile": `CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -Iinclude

c-app: src/main.c
	$(CC) $(CFLAGS) -o c-app src/main.c

clean:
	rm -f c-app
`,
        "c-app/README.md": `# C App

{generated}

Build with \`make\` and run \`./c-app\`.
`,
        "c-app/.gitignore": `c-app
*.o
*.exe
`
    }
},
    cpp: {
    label: `C++`,
    tree: `cpp-app/
    src/
        main.cpp
    include/
        app.hpp
    CMakeLists.txt
    README.md
    .gitignore`,
    files: {
        "cpp-app/include/app.hpp": `#pragma once
#include <string>

namespace app {
    std::string greeting();
}
`,
        "cpp-app/src/main.cpp": `#include <iostream>
#include "app.hpp"

namespace app {
    std::string greeting() {
        return "Hello from C++";
    }
}

int main() {
    std::cout << app::greeting() << std::endl;
    return 0;
}
`,
        "cpp-app/CMakeLists.txt": `cmake_minimum_required(VERSION 3.16)
project(cpp-app LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(cpp-app src/main.cpp)
target_include_directories(cpp-app PRIVATE include)
`,
        "cpp-app/README.md": `# C++ App

{generated}

Configure with \`cmake -B build\` and build with \`cmake --build build\`.
`,
        "cpp-app/.gitignore": `build/
cmake-build-*/
*.exe
*.o
`
    }
},
    csharp: {
    label: `C#`,
    tree: `csharp-app/
    Program.cs
    csharp-app.csproj
    README.md
    .gitignore`,
    files: {
        "csharp-app/Program.cs": `Console.WriteLine("Hello from C#");
`,
        "csharp-app/csharp-app.csproj": `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <RootNamespace>CsharpApp</RootNamespace>
  </PropertyGroup>
</Project>
`,
        "csharp-app/README.md": `# C# App

{generated}

Run with \`dotnet run\`.
`,
        "csharp-app/.gitignore": `bin/
obj/
*.user
.vs/
`
    }
}
};
