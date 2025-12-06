# script.py
import time
import sys

print("Starting execution...", flush=True) # 使用 flush=True
time.sleep(2)

print("Processing step 1...", flush=True)
time.sleep(3)

# 可以模拟一个错误
# sys.stderr.write("A simulated error occurred!\n")
# sys.stderr.flush()

print("Execution finished.", flush=True)