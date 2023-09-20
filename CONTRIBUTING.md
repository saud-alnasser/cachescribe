# Contribution Guidelines

when contributing to the package, before opening a new pull request, try searching through the [issue tracker][issue-tracker], if you want to make code changes based on your personal opinion(s), please make sure you [open an issue][open-issue] first describing the changes you want to make, and open a pull request only when your suggestions get approved by the maintainers.

## How to Contribute

### Prerequisites

in order to not waste your time implementing a change that has already been declined, or is generally not needed, start by
checking if there's an existing issue related to the change you want to make if not [open an issue][open-issue] describing the problem you would like to solve.

### Setup your environment

_Some commands will assume you have the Github CLI installed, if you haven't, consider [installing it][github-cli], but you can always use the Web UI if you prefer that instead._

in order to contribute to this project, you will need to fork the repository:

```bash
gh repo fork saud-alnasser/cachescribe
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

### Implement your changes

when making commits, make sure to follow the [conventional commit][conventional-commits] guidelines, i.e. prepending the message with `feat:`, `fix:`, `chore:`, `docs:`, etc... You can use `git status` to double check which files have not yet been staged for commit:

```bash
git add <file> && git commit -m 'feat/fix/chore/docs: commit message'
```

### When you're done

pull changes to the main branch

```bash
git checkout main && git pull 
```

merge changes into your dev branch and resolve conflicts

```bash
git checkout <dev-branch> && git merge main -m 'feat: merge `main` into `<dev-branch>`'
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

and fill out the title and body appropriately. again, make sure to follow the [conventional commit][conventional-commits] guidelines for your title.

[issue-tracker]: https://github.com/saud-alnasser/cachescribe/issues
[open-issue]: https://github.com/saud-alnasser/cachescribe/issues/new/choose
[github-cli]: (https://github.com/cli/cli#installation)
[conventional-commits]: https://www.conventionalcommits.org/en/v1.0.0/
[pnpm]: https://pnpm.io
