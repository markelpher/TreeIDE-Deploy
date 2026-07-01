/**
 * TreeIDE - systems project templates
 */

export const systemsTemplates = {
    go: {
    label: `Go`,
    tree: `{projectName}/
    cmd/
        app/
            main.go
    internal/
        app/
            app.go
    go.mod
    README.md
    .gitignore`,
    files: {
        "{projectName}/go.mod": `module {projectName}

go 1.22
`,
        "{projectName}/cmd/app/main.go": `package main

import "fmt"

func main() {
    fmt.Println("Hello from {projectName}")
}
`,
        "{projectName}/internal/app/app.go": `package app

// App is the core package for {projectName}.
type App struct{}
`,
        "{projectName}/README.md": `# {projectName}

{generated}
`,
        "{projectName}/.gitignore": `bin/
dist/
*.exe
`
    }
},
    java: {
    label: `Java`,
    tree: `java-app/
    src/
        main/
            java/
                com/
                    example/
                        App.java
    pom.xml
    README.md
    .gitignore`,
    files: {
        "java-app/src/main/java/com/example/App.java": `package com.example;

public class App {
    public static void main(String[] args) {
        System.out.println("Hello from Java");
    }
}
`,
        "java-app/pom.xml": `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>java-app</artifactId>
    <version>1.0.0</version>
    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
</project>
`,
        "java-app/README.md": `# Java App

{generated}

Compile and run with Maven.
`,
        "java-app/.gitignore": `target/
.idea/
*.iml
`
    }
},
    kotlin: {
    label: `Kotlin`,
    tree: `kotlin-app/
    src/
        main/
            kotlin/
                Main.kt
    build.gradle.kts
    settings.gradle.kts
    README.md
    .gitignore`,
    files: {
        "kotlin-app/src/main/kotlin/Main.kt": `fun main() {
    println("Hello from Kotlin")
}
`,
        "kotlin-app/build.gradle.kts": `plugins {
    kotlin("jvm") version "2.0.0"
    application
}

group = "com.example"
version = "1.0.0"

application {
    mainClass.set("MainKt")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(kotlin("stdlib"))
}
`,
        "kotlin-app/settings.gradle.kts": `rootProject.name = "kotlin-app"
`,
        "kotlin-app/README.md": `# Kotlin App

{generated}

Run with \`./gradlew run\`.
`,
        "kotlin-app/.gitignore": `.gradle/
build/
.idea/
*.iml
`
    }
},
    rust: {
    label: `Rust`,
    tree: `rust-app/
    src/
        main.rs
    Cargo.toml
    README.md
    .gitignore`,
    files: {
        "rust-app/src/main.rs": `fn main() {
    println!("Hello from Rust");
}
`,
        "rust-app/Cargo.toml": `[package]
name = "rust-app"
version = "0.1.0"
edition = "2021"

[dependencies]
`,
        "rust-app/README.md": `# Rust App

{generated}

Run with \`cargo run\`.
`,
        "rust-app/.gitignore": `/target
Cargo.lock
`
    }
},
    ruby: {
    label: `Ruby`,
    tree: `ruby-app/
    lib/
        app.rb
    bin/
        run
    Gemfile
    README.md
    .gitignore`,
    files: {
        "ruby-app/lib/app.rb": `module App
  def self.greet
    "Hello from Ruby"
  end
end
`,
        "ruby-app/bin/run": `#!/usr/bin/env ruby
require_relative "../lib/app"

puts App.greet
`,
        "ruby-app/Gemfile": `source "https://rubygems.org"

gem "rake"
`,
        "ruby-app/README.md": `# Ruby App

{generated}

Run with \`ruby bin/run\`.
`,
        "ruby-app/.gitignore": `.bundle/
vendor/bundle
`
    }
},
    swift: {
    label: `Swift`,
    tree: `swift-app/
    Sources/
        App/
            main.swift
    Package.swift
    README.md
    .gitignore`,
    files: {
        "swift-app/Sources/App/main.swift": `print("Hello from Swift")
`,
        "swift-app/Package.swift": `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "swift-app",
    targets: [
        .executableTarget(name: "App")
    ]
)
`,
        "swift-app/README.md": `# Swift App

{generated}

Run with \`swift run\`.
`,
        "swift-app/.gitignore": `.build/
.swiftpm/
`
    }
},
    dart: {
    label: `Dart`,
    tree: `dart-app/
    bin/
        dart_app.dart
    lib/
        app.dart
    pubspec.yaml
    README.md
    .gitignore`,
    files: {
        "dart-app/lib/app.dart": `String greet() => 'Hello from Dart';
`,
        "dart-app/bin/dart_app.dart": `import 'package:dart_app/app.dart';

void main() {
  print(greet());
}
`,
        "dart-app/pubspec.yaml": `name: dart_app
description: Tree IDE Dart starter
version: 1.0.0
environment:
  sdk: ^3.5.0
`,
        "dart-app/README.md": `# Dart App

{generated}

Run with \`dart run bin/dart_app.dart\`.
`,
        "dart-app/.gitignore": `.dart_tool/
build/
`
    }
}
};
