module.exports = {
  apps: [
    {
      name: 'pasco-lab-portal',
      script: 'npm',
      args: 'run start -- --hostname 127.0.0.1 --port 3000',
      cwd: '/var/www/project1',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      exp_backoff_restart_delay: 100,
      kill_timeout: 10000,
      max_memory_restart: '1G',
      min_uptime: 10000,
      restart_delay: 1000,
    },
  ],
}
