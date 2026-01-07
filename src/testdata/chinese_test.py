import logging
import sys
import io
log = logging.getLogger('default_logger')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
stream_handler = logging.StreamHandler(sys.stdout);

log.addHandler(stream_handler)
log.setLevel(logging.DEBUG)
log.info('你好')
