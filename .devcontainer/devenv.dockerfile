FROM hadmarine/docker-environments:ubuntu20-node_latest

# SHELL ["/bin/zsh", "-c", "source ~/.profile && "]
SHELL [ "/bin/bash", "-c" ]

RUN git config --global core.autocrlf input
RUN source ~/.profile && npm i -g @nestjs/cli

RUN sudo usermod -aG docker ${USERNAME}
RUN newgrp docker
# RUN sudo chgrp docker /lib/systemd/system/docker.socket
# RUN sudo chmod g+w /lib/systemd/system/docker.socket

RUN sudo apt install -y unzip

RUN curl unzip awscliv2.zip && sudo ./aws/install


CMD [ "zsh" ]