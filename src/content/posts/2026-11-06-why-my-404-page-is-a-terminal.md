---
title: Why my 404 page is a terminal
date: 2026-11-06
summary: The error message already said "No such file or directory". So the game is to go and find the file.
tags: [portfolio, games, javascript]
---

Most 404 pages apologise. Mine used to as well: a big number, a line of copy, three buttons. Then I wanted it to be a game, and the first version was a runner, the kind where a block jumps over obstacles. It worked. It was also a game that could sit on anyone's site.

The page itself had a better idea. Above the 404 it prints a fake shell session:

```
$ cat this-page.md
cat: this-page.md: No such file or directory
```

If the file is missing, the game is to find it.

## The hunt

The 404 now has a small terminal. It runs on a fake filesystem of this portfolio: a home directory with `projects/`, a `.config/` nobody looks in, a `.secrets/.env` that says "nice try", and `/var/www/lost+found`, where the page actually went. `ls -a`, `cd`, `cat`, `find`, `grep -r` and `tree` work the way you'd expect. Tab completes names.

There are two ways through. Read the files and follow the notes: the README points to a note in `projects/`, the note hints at hidden files, and the config names the folder. Or know Unix and type `find / -name this-page.md`, which is two moves and the rank "sysadmin". Hints exist, and cost two moves each.

## How it's built

The page is a plain HTML entry that Vite bundles alongside the app. The site's Content-Security-Policy has no `unsafe-inline`, so the game is a module, not a script block. The shell itself is a pure function: give it the state and a command line, get back the lines to print. That made it easy to test, and the tests are what caught `cat` on a directory and `cd` into a file.

On a phone, every file and folder in the current directory is a tappable chip, so the whole thing plays without a keyboard.
