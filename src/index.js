const core = require('@actions/core')
const github = require('@actions/github')
const parser = require('action-input-parser')

run()

async function run() {
    try {
        const ghToken = core.getInput("GITHUB_TOKEN")
        const api = github.getOctokit(ghToken)

        const organization = core.getInput("organization") || context.repo.owner
        const username = core.getInput("username")
        const team = core.getInput("team")
        const debug = core.getInput("debug") || false
        let isTeamMember = false
        let isOrgMember = false

        console.log(`will check if ${username} belongs to ${organization}`);
        try {
            const {data: data} = await api.rest.teams.getMembershipForUserInOrg({
                org: organization,
                username: username,
                });
            isTeamMember = data.role && data.state === 'active';
        } catch (restError) {
            if(restError.status === 404){
                isTeamMember = false
            } else {
                throw restError
            }
        }
        
        core.setOutput("isTeamMember", isTeamMember)
        core.setOutput("isOrgMember", isOrgMember)
        console.log(`${username} is member of ${organization}`)

        if (isOrgMember) {
            console.log(`Will check if ${username} belongs to ${team}`)
            core.setOutput("isTeamMember", false)
            try {
                const {data: data} = await api.rest.teams.getMembershipForUserInOrg({
                    org: organization,
                    team_slug: team,
                    username: username,
                    });
                isTeamMember = data.role && data.state === 'active';
            } catch (restError) {
                if(restError.status === 404){
                    isTeamMember = false
                } else {
                    throw restError
                }
            }
            core.setOutput("isTeamMember", isTeamMember)
            console.log(`${username} is member of ${organization}/${team}: ${isTeamMember}`)
        }
    } catch (error) {
        console.log(error)
        core.setOutput("isTeamMember", false)
        core.setOutput("isOrgMember", false)
        core.setFailed(error.message);
    }
}