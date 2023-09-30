# Contribution Guidelines

when contributing, try searching through the [issue tracker][issue-tracker] for issues to tackle, if you want to make code changes based on your personal opinion(s), in order to not wast your time please make sure you [open an issue][open-issue] first describing the changes you want to make, and only start making the implementation when your suggestions get approved by the maintainers.

## How to Contribute

in this project we follow the [stacking workflow][stacking-learn], using graphite. if you're not familiar with the workflow, please read the [stacking][stacking-learn] overview first, then get familiar with [graphite][graphite-docs]. when making small changes i.e. bug fixes or small refactors no more than hundred lines of code you can follow the [github workflow][github-workflow] if you want.

### Setup your environment

_some commands will assume you have the Github CLI installed, if you haven't, consider [installing it][github-cli], but you can always use the Web UI if you prefer that instead._

in order to contribute to this project, you will need to fork the repository:

```bash
gh repo fork saud-alnasser/cachscribe
```

then, clone it to your local machine:

```bash
gh repo clone <your-github-name>/cachescribe
```

this project uses [pnpm] as its package manager. install it if you haven't already:

```bash
npm install -g pnpm
```

then, install the project's dependencies:

```bash
pnpm install
```

if you are going to use the [stacking workflow][stacking-learn] make sure you setup [graphite][graphite-docs], 
ensure that you use `graphite/` as a prefix for branch names also use dashes (`-`) instead of underscores (`_`).

### Stacking Workflow with Graphite

#### Implement your changes

sync your local repository with the upstream repository:

```bash
gt sync
```

choice the stack to start off, either the trunk (main) or other stacks:

_here we will use the trunk branch_

```bash
gt trunk
```

make the changes you want, and then check that your code follows the project's style guidelines and that all tests are passing by running:

```bash
pnpm check
```

if your change should appear in the changelog, it must be captured by `changeset` which is done by running:

> **note**: consider using the `<br>` tag at the top when the changes summary span over multiple lines.

```bash
pnpm changeset
```

then create stack and submit it, make sure to follow the [conventional commit][conventional-commits] guidelines:

```bash
gt c -am '(feat/fix/chore/docs): <commit-message>' && gt ss
```

### GitHub Workflow

#### Implement your changes

pull changes to the main branch

```bash
git checkout main && git pull
```

create a new branch for your changes:

```bash
git checkout main && git switch -C <dev-branch>
```

when making commits, make sure to follow the [conventional commit][conventional-commits] guidelines.

```bash
git add <file> && git commit -m '(feat/fix/chore/docs): <commit-message>'
```

#### When you're done

pull changes to the main branch

```bash
git checkout main && git pull
```

merge changes into your dev branch and resolve conflicts

```bash
git checkout <dev-branch> && git merge main -m 'chore: merge `main` into `<dev-branch>`'
```

check that your code follows the project's style guidelines and that all tests are passing by running:

```bash
pnpm check
```

please also make a manual, functional test of your changes.

if your change should appear in the changelog, it must be captured by `changeset` which is done by running:

> **note**: consider using the `<br>` tag at the top when the changes summary span over multiple lines.

```bash
pnpm changeset
```

then, add the generated changeset to git:

```bash
git add .changeset/*.md && git commit -m 'chore: add changeset(s)'
```

when all that's done, it's time to file a pull request to upstream:

> **note**: all pull requests should target the `main` branch.

```bash
gh pr create --web
```

and fill out the title and body appropriately. again, make sure to follow the [conventional commit][conventional-commits] guidelines for your pr title.

[issue-tracker]: https://github.com/saud-alnasser/cachescribe/issues
[open-issue]: https://github.com/saud-alnasser/cachescribe/issues/new/choose
[github-cli]: (https://github.com/cli/cli#installation)
[conventional-commits]: https://www.conventionalcommits.org/en/v1.0.0/
[github-workflow]: https://docs.github.com/en/get-started/quickstart/github-flow
[graphite-docs]: https://graphite.dev/docs/
[stacking-learn]: https://stacking.dev
[pnpm]: https://pnpm.io
