export async function listen(server, { port, host, retry = false, onRetry = () => {} }) {
  for (let attempt = 0; ; attempt++) {
    try {
      await new Promise((resolve, reject) => {
        const fail = (error) => { server.off('listening', ready); reject(error); };
        const ready = () => { server.off('error', fail); resolve(); };
        server.once('error', fail);
        server.once('listening', ready);
        server.listen(port, host);
      });
      return server.address().port;
    } catch (error) {
      if (error.code !== 'EADDRINUSE' || !retry || attempt >= 19 || port >= 65535) throw error;
      onRetry(port);
      port++;
    }
  }
}
