/**
 * LeetCode API utility to fetch user statistics
 * Uses LeetCode's GraphQL API (no authentication required for public profiles)
 */

export const fetchLeetCodeStats = async (username) => {
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            userAvatar
            realName
            aboutMe
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
            totalSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          userCalendar {
            streak
            totalActiveDays
          }
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL error: ${data.errors[0].message}`);
    }

    const userProfile = data.data.matchedUser;

    if (!userProfile) {
      throw new Error('User not found');
    }

    return {
      username: userProfile.username,
      avatar: userProfile.profile?.userAvatar,
      realName: userProfile.profile?.realName || username,
      aboutMe: userProfile.profile?.aboutMe || '',
      stats: {
        totalSolved: userProfile.submitStatsGlobal.acSubmissionNum[0]?.count || 0,
        easy: userProfile.submitStatsGlobal.acSubmissionNum.find(s => s.difficulty === 'Easy')?.count || 0,
        medium: userProfile.submitStatsGlobal.acSubmissionNum.find(s => s.difficulty === 'Medium')?.count || 0,
        hard: userProfile.submitStatsGlobal.acSubmissionNum.find(s => s.difficulty === 'Hard')?.count || 0,
        totalSubmissions: userProfile.submitStatsGlobal.totalSubmissionNum[0]?.count || 0,
      },
      streak: userProfile.userCalendar?.streak || 0,
      totalActiveDays: userProfile.userCalendar?.totalActiveDays || 0,
    };
  } catch (error) {
    console.error('Error fetching LeetCode stats:', error);
    return null;
  }
};

export const fetchGitHubProjects = async (username) => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const repos = await response.json();

    return repos
      .filter(repo => !repo.fork) // Exclude forked repos
      .map(repo => ({
        name: repo.name,
        description: repo.description || 'No description',
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language,
        topics: repo.topics || [],
        updatedAt: new Date(repo.updated_at).toLocaleDateString(),
      }));
  } catch (error) {
    console.error('Error fetching GitHub projects:', error);
    return [];
  }
};