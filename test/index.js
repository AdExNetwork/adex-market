const tape = require('tape')
const {
	isInitializing,
	isOffline,
	isDisconnected,
	isInvalid,
	isUnhealthy,
	isReady,
	isActive,
	isExhausted,
	isExpired,
} = require('../lib/getStatus')
const vtm = require('./validatorTestMessages')

tape('isInitializing()', function(t) {
	t.equals(
		isInitializing(vtm.initializing.first),
		true,
		'two empty message arrays return true'
	)
	t.equals(
		isInitializing(vtm.initializing.second),
		true,
		'firt message array empty return true'
	)
	t.equals(
		isInitializing(vtm.initializing.third),
		true,
		'second message array empty return true'
	)
	t.equals(
		isInitializing(vtm.notInitializing.first),
		false,
		'two arrays with messages return false'
	)
	t.end()
})

tape('isOffline()', function(t) {
	t.equals(
		isOffline(vtm.offline.first),
		true,
		'Two messages with not recent heartbeat messages return true'
	)
	t.equals(
		isOffline(vtm.offline.second),
		true,
		"When first message has recent heartbeat timestamp but second hasn't return true"
	)
	t.equals(
		isOffline(vtm.offline.third),
		true,
		"When second message has recent heartbeat timestamp but first hasn't return true"
	)
	t.equals(
		isOffline(vtm.notOffline.first),
		false,
		'When both messages have a heartbeat with recent timestamp return false'
	)
	t.end()
})

tape('isDisconnected()', function(t) {
	t.equals(
		isDisconnected(vtm.disconnected.first),
		true,
		'No recent heartbeat messages on both sides returns true'
	)
	t.equals(
		isDisconnected(vtm.disconnected.second),
		true,
		' No recent leader heartbeat messages on follower returns true'
	)
	t.equals(
		isDisconnected(vtm.disconnected.third),
		true,
		'No recent follower heartbeat messages on leader returns true'
	)
	t.equals(
		isDisconnected(vtm.notDisconnected.first),
		false,
		'Both validators has recent heartbeat messages return false'
	)
	t.end()
})

tape('isInvalid()', function(t) {
	t.equals(
		isInvalid(vtm.invalid.first),
		true,
		'Recent NewState messages but follower does not propagate approveState returns true'
	)
	t.equals(
		isInvalid(vtm.invalid.second),
		true,
		'Recent NewState, but old ApproveState returns true'
	)
	t.equals(
		isInvalid(vtm.invalid.third),
		true,
		'Recent ApproveState but old NewState returns true'
	)
	t.equals(
		isInvalid(vtm.invalid.fourth),
		true,
		'Old ApproveState and old NewState returns true'
	)
	t.equals(
		isInvalid(vtm.notInvalid.first),
		false,
		'Recent NewState messages and follower propagates approveState returns false'
	)
	t.equals(
		isInvalid(vtm.notInvalid.second),
		false,
		"Follower does not propagate approveState but one of the NewState messages isn't recent returns false"
	)
	t.equals(
		isInvalid(vtm.notInvalid.third),
		false,
		'ApproveState but no recent NewState returns false'
	)
	t.equals(
		isInvalid(vtm.notInvalid.fourth),
		false,
		'0 NewState messages and no ApproveState returns false'
	)
	t.end()
})

tape('isUnhealthy()', function(t) {
	t.equals(
		isUnhealthy(vtm.unhealthy.first),
		true,
		'Recent NewState and approveState but approveState reports unhealthy returns true'
	)
	t.equals(
		isUnhealthy(vtm.notUnhealthy.first),
		false,
		'Recent NewState and approveState and approveState reports healthy returns false'
	)
	t.equals(
		isUnhealthy(vtm.notUnhealthy.second),
		false,
		'No recent Heartbeat returns false'
	)
	t.end()
})

// Do for Waiting

tape('isReady()', function(t) {
	t.equals(
		isReady(vtm.ready.first),
		true,
		'Recent Heartbeat messages but no NewState messages returns true'
	)
	t.equals(
		isReady(vtm.notReady.first),
		false,
		'One message has no recent Heartbeat and both messages have NewState returns false'
	)
	t.equals(
		isReady(vtm.notReady.second),
		false,
		'No NewState but one message has no recent HeartBeat returns false'
	)
	t.equals(
		isReady(vtm.notReady.third),
		false,
		'Recent NewState messages but no Heartbeats returns false'
	)
	t.end()
})

tape('isActive()', function(t) {
	t.equals(
		isActive(vtm.active.first),
		true,
		"there are recent NewState, ApproveState and Heartbeat's, and the ApproveState reports healthy returns true"
	)
	t.equals(
		isActive(vtm.notActive.first),
		false,
		'recent NewState and Heartbeat but ApproveState reports unhealthy returns false'
	)
	t.equals(
		isActive(vtm.notActive.second),
		false,
		'recent Newstate and ApproveState reports healthy but no recent Heartbeat message returns false'
	)
	t.equals(
		isActive(vtm.notActive.third),
		false,
		'recent NewState and Heartbeat but there is no ApproveState message returns false'
	)
	t.end()
})

tape('isExhausted()', function(t) {
	t.equals(
		isExhausted(vtm.exhausted.first.campaign, vtm.exhausted.first.balanceTree),
		true,
		'balances are more than deposit amount returns true'
	)
	t.equals(
		isExhausted(
			vtm.exhausted.second.campaign,
			vtm.exhausted.second.balanceTree
		),
		true,
		'balances are equal to deposit amount returns true'
	)
	t.equals(
		isExhausted(
			vtm.notExhausted.first.campaign,
			vtm.notExhausted.first.balanceTree
		),
		false,
		'balances are less than deposit amount returns false'
	)
	t.end()
})

tape('isExpired()', function(t) {
	t.equals(
		isExpired(vtm.expired.first.campaign),
		true,
		'validUntil has passed returns true'
	)
	t.equals(
		isExpired(vtm.notExpired.first.campaign),
		false,
		'validUntil has not passed returns false'
	)
	t.end()
})

require('./usdEstimation')
