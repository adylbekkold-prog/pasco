module.exports = {
  apps: [
    {
      name: 'pasco-lab-portal',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/pasco-lab-portal',
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
