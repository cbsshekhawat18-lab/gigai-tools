#!/bin/bash
# Logs a warning before the OOM killer or a full disk acts.
FREE_MB=$(df -m / | awk 'NR==2{print $4}')
AVAIL_MB=$(awk '/MemAvailable/{print int($2/1024)}' /proc/meminfo)
if [ "$FREE_MB" -lt 800 ]; then
  logger -p user.warning -t gigai-pressure "LOW DISK: ${FREE_MB}MB free (threshold 800MB)"
fi
if [ "$AVAIL_MB" -lt 200 ]; then
  logger -p user.warning -t gigai-pressure "LOW MEMORY: ${AVAIL_MB}MB available (threshold 200MB)"
fi
