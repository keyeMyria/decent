const { h, Component } = require('preact')
const Modal = require('/Modal')
const Dropdown = require('/Dropdown')

class SessionInfo extends Component {
  state = {
    me: null,
    serverName: null,
    signInVisible: false,
    registerVisible: false,
    userDrop: false,
  }

  componentDidMount() {
    const { pool } = this.context

    const onLogin = () => {
      const { me } = pool.activeServer.client

      this.setState({me})

      me.on('change', () => {
        // this.state.me may update automatically but we need to rerender
        this.forceUpdate()
      })
    }

    pool.activeClientEE.on('login', onLogin)
    if (pool.activeServer.client.me) onLogin()

    pool.activeClientEE.on('logout', () => {
      this.setState({me: null})
    })

    this.setState({serverName: pool.activeServer.client.serverName})
  }

  render(_, { me, serverName, signInVisible, registerVisible, userDrop }) {
    if (me) {
      return <div class='Sidebar-section SessionInfo --signed-in'>
        <div class='SessionInfo-user' onClick={evt => {
          this.setState({userDrop: evt})
        }}>
          <img src={me.avatarURL} class='SessionInfo-avatar Avatar' />
          <span class='SessionInfo-username'>{me.username}</span>
        </div>

        <span class='SessionInfo-spacer'></span>

        {/* TODO: client settings button etc */}

        {userDrop && <Dropdown
          anchor='bottom'
          x={userDrop.clientX}
          y={document.body.clientHeight - userDrop.clientY}
          onClose={() => this.setState({userDrop: false})}
        >
          <div class='Dropdown-text'>Signed in as <b>{me.username}</b></div>
          <div class='Dropdown-separator'></div>
          <div class='Dropdown-listItem' onClick={() => {
            this.context.pool.activeServer.client.logout()
          }}>Sign out</div>
        </Dropdown>}
      </div>
    } else {
      return <div class='Sidebar-section SessionInfo'>
        <div class='SessionInfo-signedOutText'>Signed out of <b>{serverName}</b></div>

        <div class='SessionInfo-signedOutActions'>
          <button class='Button --no-bg --outlined' onClick={() => this.setState({signInVisible: true})}>Sign in</button>
          <span>or</span>
          <button class='Button --no-bg' onClick={() => this.setState({registerVisible: true})}>Register</button>
        </div>

        {signInVisible && <Modal.Async
          title='Sign in'
          subtitle={`to ${serverName}`}
          submit={({ username, password }) =>
            this.context.pool.activeServer.client.login(username, password)}
          onHide={() => this.setState({signInVisible: false})}
        >
          <Modal.Input focus name='username' label='Username'/>
          <Modal.Input final name='password' label='Password' type='password'/>

          <Modal.Button action='submit'>Login</Modal.Button>
          <Modal.Button class='--no-bg' action='cancel'>Cancel</Modal.Button>
        </Modal.Async>}

        {registerVisible && <Modal.Async
          title='Register'
          subtitle={`on ${serverName}`}
          submit={async ({ username, password }) => {
            await this.context.pool.activeServer.client.register(username, password)
            await this.context.pool.activeServer.client.login(username, password)
          }}
          onHide={() => this.setState({registerVisible: false})}
        >
          <Modal.Input focus name='username' label='Username'/>
          <Modal.Input final name='password' label='Password' type='password'/>

          <Modal.Button action='submit'>Create account</Modal.Button>
          <Modal.Button class='--no-bg' action='cancel'>Cancel</Modal.Button>
        </Modal.Async>}
      </div>
    }
  }
}

module.exports = SessionInfo