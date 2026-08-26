#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TrendRadar Dashboard Server 本地快捷启动入口
"""
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).resolve().parent))

from docker.server import run_server

if __name__ == "__main__":
    run_server()
