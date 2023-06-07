import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import MiniModal from "../../components/Modal/MiniModal";
import { showError, showSuccess } from "../../ducks/notifications";
import { getPassphrase, fetchWallet } from "../../ducks/walletActions";
import "./max-idle-modal.scss";
import {I18nContext} from "../../utils/i18n";
import walletClient from "../../utils/walletClient";

@withRouter
@connect(
  (state) => ({
    lookahead: state.wallet.lookahead,
  }),
  (dispatch) => ({
    getPassphrase: (resolve, reject) => dispatch(getPassphrase(resolve, reject)),
    fetchWallet: () => dispatch(fetchWallet()),
    showSuccess: (message) => dispatch(showSuccess(message)),
    showError: (message) => dispatch(showError(message)),
  })
)
export default class MaxIdleModal extends Component {
  static propTypes = {
    lookahead: PropTypes.number.isRequired,
    getPassphrase: PropTypes.func.isRequired,
    fetchWallet: PropTypes.func.isRequired,
    showError: PropTypes.func.isRequired,
    showSuccess: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  };

  static contextType = I18nContext;

  constructor(props) {
    super(props);
    this.state = {
      lookahead: props.lookahead,
    };
  }

  onChangeLookahead = async () => {
    const {lookahead} = this.state;
    try {
      if (await walletClient.isLocked(true)) {
        await new Promise((resolve, reject) => {
          this.props.getPassphrase(resolve, reject, true);
        });
      }
      await walletClient.changeLookahead(lookahead);
      await this.props.fetchWallet();
      this.props.showSuccess('Updated lookahead.');
      this.props.history.goBack();
    } catch (e) {
      console.error(e);
      this.props.showError(e.message);
      this.props.history.goBack();
    }
  };

  render() {
    const {t} = this.context;

    return (
      <MiniModal title="Change Wallet Lookahead" closeRoute="/settings/wallet" centered>
        <div className="max-idle-modal__instructions">
          DO NOT USE UNLESS YOU KNOW WHAT YOU'RE DOING.
        </div>
        <div className="max-idle-modal__input">
          <input
            type="number"
            value={this.state.lookahead}
            onChange={(e) => this.setState({ lookahead: e.target.value >>> 0 })}
            placeholder="200"
            min="200"
            autoFocus
          />{" "}
        </div>
        <button
          className="max-idle-modal__submit"
          onClick={this.onChangeLookahead}
        >
          {t('update')}
        </button>
      </MiniModal>
    );
  }
}
