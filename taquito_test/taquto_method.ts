import {
  concat,
  defer,
  from,
  MonoTypeOperatorFunction,
  Observable,
  of,
  range,
  ReplaySubject,
  SchedulerLike,
  throwError,
  timer,
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  first,
  map,
  shareReplay,
  takeWhile,
  tap,
  concatMap,
  distinctUntilKeyChanged,
  startWith,
  switchMap,
  timeoutWith,
} from 'rxjs/operators';
import BigNumber from 'bignumber.js';
// import Bs58check from 'bs58check-ts';

export interface WalletTransferParams {
    to: string;
    amount: number;
    fee?: number;
    parameter?: TransactionOperationParameter;
    gasLimit?: number;
    storageLimit?: number;
    mutez?: boolean;
}

export interface TransactionOperationParameter {
    entrypoint: string;
    value: MichelsonV1Expression;
}

export interface MichelsonV1ExpressionExtended {
  prim: string;
  args?: MichelsonV1Expression[];
  annots?: string[];
}

export type MichelsonV1Expression =
    | MichelsonV1ExpressionBase
    | MichelsonV1ExpressionExtended
    | MichelsonV1Expression[];

export interface MichelsonV1ExpressionBase {
    int?: string;
    string?: string;
    bytes?: string;
};

export interface OperationFactoryConfig {
  blockIdentifier?: string;
}

var walletCommand = <T>(send: () => Promise<T>) => {
    return {
        send,
    };
};

var mapTransferParamsToWalletParams: (params: () => Promise<WalletTransferParams>) => Promise<any>;
var sendOperations: (params: any[]) => Promise<string>;
export enum OpKind {
    ORIGINATION = 'origination',
    DELEGATION = 'delegation',
    REVEAL = 'reveal',
    TRANSACTION = 'transaction',
    ACTIVATION = 'activate_account',
    ENDORSEMENT = 'endorsement',
    ENDORSEMENT_WITH_SLOT = 'endorsement_with_slot',
    SEED_NONCE_REVELATION = 'seed_nonce_revelation',
    DOUBLE_ENDORSEMENT_EVIDENCE = 'double_endorsement_evidence',
    DOUBLE_BAKING_EVIDENCE = 'double_baking_evidence',
    PROPOSALS = 'proposals',
    BALLOT = 'ballot',
    FAILING_NOOP = 'failing_noop',
    REGISTER_GLOBAL_CONSTANT = 'register_global_constant'
}

export interface OperationContentsAndResultReveal {
    kind: OpKind.REVEAL;
    source: string;
    fee: string;
    counter: string;
    gas_limit: string;
    storage_limit: string;
    public_key: string;
    metadata: OperationContentsAndResultMetadataReveal;
}

export type InternalOperationResultKindEnum =
    | OpKind.REVEAL
    | OpKind.TRANSACTION
    | OpKind.ORIGINATION
    | OpKind.DELEGATION
    | OpKind.REGISTER_GLOBAL_CONSTANT;

export interface ScriptedContracts {
    code: MichelsonV1Expression[];
    storage: MichelsonV1Expression;
}

export interface TezosGenericOperationError {
    kind: string;
    id: string;
}

export interface OperationResultDelegation {
    status: OperationResultStatusEnum;
    consumed_gas?: string;
    errors?: TezosGenericOperationError[];
    consumed_milligas?: string;
}

export interface OperationBalanceUpdatesItem {
    kind: BalanceUpdateKindEnum;
    category?: BalanceUpdateCategoryEnum;
    delegate?: string;
    cycle?: number;
    contract?: string;
    change: string;
    origin?: MetadataBalanceUpdatesOriginEnum;
}

export interface LazyStorageDiffUpdatesBigMap {
    key_hash: string;
    key: MichelsonV1Expression;
    value?: MichelsonV1Expression;
}

export interface LazyStorageDiffBigMapItems {
    action: DiffActionEnum;
    updates?: LazyStorageDiffUpdatesBigMap[];
    source?: string;
    key_type?: MichelsonV1Expression;
    value_type?: MichelsonV1Expression;
}

export interface LazyStorageDiffBigMap {
    kind: 'big_map';
    id: string;
    diff: LazyStorageDiffBigMapItems;
}

export interface LazyStorageDiffSaplingStateItems {
  action: DiffActionEnum;
  updates?: LazyStorageDiffUpdatesSaplingState;
  source?: string;
  memo_size?: number;
}

export interface LazyStorageDiffUpdatesSaplingState {
  commitments_and_ciphertexts: CommitmentsAndCiphertexts[];
  nullifiers: string[];
}

export type CommitmentsAndCiphertexts = [
  SaplingTransactionCommitment,
  SaplingTransactionCiphertext
];

export interface SaplingTransactionCiphertext {
  cv: string;
  epk: string;
  payload_enc: string;
  nonce_enc: string;
  payload_out: string;
  nonce_out: string;
}

export interface LazyStorageDiffSaplingState {
  kind: 'sapling_state';
  id: string;
  diff: LazyStorageDiffSaplingStateItems;
}

export type ContractBigMapDiff = ContractBigMapDiffItem[];
export type SaplingTransactionCommitment = string;
export type DiffActionEnum = 'update' | 'remove' | 'copy' | 'alloc';
export type OperationBalanceUpdates = OperationBalanceUpdatesItem[];
export type LazyStorageDiff = LazyStorageDiffBigMap | LazyStorageDiffSaplingState;
export type BalanceUpdateKindEnum = 'contract' | 'freezer';
export type BalanceUpdateCategoryEnum = 'rewards' | 'fees' | 'deposits';
export type MetadataBalanceUpdatesOriginEnum = 'block' | 'migration' | 'subsidy';

export interface ContractBigMapDiffItem {
    key_hash?: string;
    key?: MichelsonV1Expression;
    value?: MichelsonV1Expression;
    action?: DiffActionEnum;
    big_map?: string;
    source_big_map?: string;
    destination_big_map?: string;
    key_type?: MichelsonV1Expression;
    value_type?: MichelsonV1Expression;
}

export interface OperationResultOrigination {
    status: OperationResultStatusEnum;
    big_map_diff?: ContractBigMapDiff;
    balance_updates?: OperationBalanceUpdates;
    originated_contracts?: string[];
    consumed_gas?: string;
    storage_size?: string;
    paid_storage_size_diff?: string;
    errors?: TezosGenericOperationError[];
    consumed_milligas?: string;
    lazy_storage_diff?: LazyStorageDiff[];
}

export type InternalOperationResultEnum =
    | OperationResultReveal
    | OperationResultTransaction
    | OperationResultDelegation
    | OperationResultOrigination
    | OperationResultRegisterGlobalConstant;

export interface OperationResultTransaction {
    status: OperationResultStatusEnum;
    storage?: MichelsonV1Expression;
    big_map_diff?: ContractBigMapDiff;
    balance_updates?: OperationBalanceUpdates;
    originated_contracts?: string[];
    consumed_gas?: string;
    storage_size?: string;
    paid_storage_size_diff?: string;
    allocated_destination_contract?: boolean;
    errors?: TezosGenericOperationError[];
    consumed_milligas?: string;
    lazy_storage_diff?: LazyStorageDiff[];
}

export interface OperationResultRegisterGlobalConstant {
  status: OperationResultStatusEnum;
  balance_updates?: OperationBalanceUpdates;
  consumed_gas?: string;
  storage_size?: string;
  global_address?: string;
  errors?: TezosGenericOperationError[];
}

export interface InternalOperationResult {
    kind: InternalOperationResultKindEnum;
    source: string;
    nonce: number;
    amount?: string;
    destination?: string;
    parameters?: TransactionOperationParameter;
    public_key?: string;
    balance?: string;
    delegate?: string;
    script?: ScriptedContracts;
    value?: MichelsonV1Expression;
    result: InternalOperationResultEnum;
}

export type OperationResultStatusEnum = 'applied' | 'failed' | 'skipped' | 'backtracked';
export type MetadataBalanceUpdatesKindEnum = 'contract' | 'freezer';
export type MetadataBalanceUpdatesCategoryEnum = 'rewards' | 'fees' | 'deposits';

export interface OperationContentsAndResultMetadataReveal {
    balance_updates: OperationMetadataBalanceUpdates[];
    operation_result: OperationResultReveal;
    internal_operation_results?: InternalOperationResult[];
}

export interface OperationResultReveal {
    status: OperationResultStatusEnum;
    consumed_gas?: string;
    errors?: TezosGenericOperationError[];
    consumed_milligas?: string;
}

export interface OperationMetadataBalanceUpdates {
  kind: MetadataBalanceUpdatesKindEnum;
  category?: MetadataBalanceUpdatesCategoryEnum;
  contract?: string;
  delegate?: string;
  cycle?: number;
  change: string;
  origin?: MetadataBalanceUpdatesOriginEnum;
}

export interface OperationContentsAndResultTransaction {
  kind: OpKind.TRANSACTION;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  amount: string;
  destination: string;
  parameters?: TransactionOperationParameter;
  metadata: OperationContentsAndResultMetadataTransaction;
}

export interface OperationContentsAndResultMetadataTransaction {
  balance_updates: OperationMetadataBalanceUpdates[];
  operation_result: OperationResultTransaction;
  internal_operation_results?: InternalOperationResult[];
}

export interface BlockResponse {
  protocol: string;
  chain_id: string;
  hash: string;
  header: BlockFullHeader;
  metadata: BlockMetadata;
  operations: OperationEntry[][];
}

export interface OperationContentsEndorsement {
  kind: OpKind.ENDORSEMENT;
  level: number;
}

export interface OperationContentsEndorsementWithSlot {
  kind: OpKind.ENDORSEMENT_WITH_SLOT;
  endorsement: InlinedEndorsement;
  slot: number;
}

export interface InlinedEndorsement {
  branch: string;
  operations: InlinedEndorsementContents;
  signature?: string;
}

export interface InlinedEndorsementContents {
  kind: InlinedEndorsementKindEnum;
  level: number;
}

export interface OperationContentsRevelation {
  kind: OpKind.SEED_NONCE_REVELATION;
  level: number;
  nonce: string;
}

export interface OperationContentsDoubleEndorsement {
  kind: OpKind.DOUBLE_ENDORSEMENT_EVIDENCE;
  op1: InlinedEndorsement;
  op2: InlinedEndorsement;
  slot?: number;
}

export interface OperationContentsDoubleBaking {
  kind: OpKind.DOUBLE_BAKING_EVIDENCE;
  bh1: BlockFullHeader;
  bh2: BlockFullHeader;
}

export interface OperationContentsActivateAccount {
  kind: OpKind.ACTIVATION;
  pkh: string;
  secret: string;
}

export interface OperationContentsProposals {
  kind: OpKind.PROPOSALS;
  source: string;
  period: number;
  proposals: string[];
}

export interface OperationContentsBallot {
  kind: OpKind.BALLOT;
  source: string;
  period: number;
  proposal: string;
  ballot: OperationContentsBallotEnum;
}

export interface OperationContentsReveal {
  kind: OpKind.REVEAL;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  public_key: string;
}

export interface OperationContentsTransaction {
  kind: OpKind.TRANSACTION;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  amount: string;
  destination: string;
  parameters?: TransactionOperationParameter;
}

export interface OperationContentsOrigination {
  kind: OpKind.ORIGINATION;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  balance: string;
  delegate?: string;
  script?: ScriptedContracts;
}

export interface OperationContentsDelegation {
  kind: OpKind.DELEGATION;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  delegate?: string;
}

export interface OperationContentsFailingNoop {
  kind: OpKind.FAILING_NOOP;
  arbitrary: string;
}

export interface OperationContentsRegisterGlobalConstant {
  kind: OpKind.REGISTER_GLOBAL_CONSTANT;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  value: MichelsonV1Expression;
}

export type InlinedEndorsementKindEnum = OpKind.ENDORSEMENT;
export type OperationContentsBallotEnum = 'nay' | 'yay' | 'pass';

export type OperationContents =
  | OperationContentsEndorsement
  | OperationContentsRevelation
  | OperationContentsDoubleEndorsement
  | OperationContentsDoubleBaking
  | OperationContentsActivateAccount
  | OperationContentsProposals
  | OperationContentsBallot
  | OperationContentsReveal
  | OperationContentsTransaction
  | OperationContentsOrigination
  | OperationContentsDelegation
  | OperationContentsEndorsementWithSlot
  | OperationContentsFailingNoop
  | OperationContentsRegisterGlobalConstant;

export type OperationContentsAndResult =
  | OperationContentsAndResultEndorsement
  | OperationContentsAndResultRevelation
  | OperationContentsAndResultDoubleEndorsement
  | OperationContentsAndResultDoubleBaking
  | OperationContentsAndResultActivateAccount
  | OperationContentsAndResultProposals
  | OperationContentsAndResultBallot
  | OperationContentsAndResultReveal
  | OperationContentsAndResultTransaction
  | OperationContentsAndResultOrigination
  | OperationContentsAndResultDelegation
  | OperationContentsAndResultEndorsementWithSlot
  | OperationContentsAndResultRegisterGlobalConstant;

export interface OperationContentsAndResultEndorsement {
    kind: OpKind.ENDORSEMENT;
    level: number;
    metadata: OperationContentsAndResultMetadataExtended;
}

export interface OperationContentsAndResultRegisterGlobalConstant {
  kind: OpKind.REGISTER_GLOBAL_CONSTANT;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  value: MichelsonV1Expression;
  metadata: OperationContentsAndResultMetadataRegisterGlobalConstant;
}

export interface OperationContentsAndResultMetadataRegisterGlobalConstant {
  balance_updates: OperationMetadataBalanceUpdates[];
  operation_result: OperationResultRegisterGlobalConstant;
  internal_operation_results?: InternalOperationResult[];
}

export interface OperationContentsAndResultEndorsementWithSlot {
  kind: OpKind.ENDORSEMENT_WITH_SLOT;
  endorsement: InlinedEndorsement;
  slot: number;
  metadata: OperationContentsAndResultMetadataExtended;
}

export interface OperationContentsAndResultMetadataDelegation {
  balance_updates: OperationMetadataBalanceUpdates[];
  operation_result: OperationResultDelegation;
  internal_operation_results?: InternalOperationResult[];
}

export interface OperationContentsAndResultDelegation {
  kind: OpKind.DELEGATION;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  delegate?: string;
  metadata: OperationContentsAndResultMetadataDelegation;
}

export interface OperationContentsAndResultOrigination {
  kind: OpKind.ORIGINATION;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  balance: string;
  delegate?: string;
  script?: ScriptedContracts;
  metadata: OperationContentsAndResultMetadataOrigination;
}

export interface OperationContentsAndResultMetadataOrigination {
  balance_updates: OperationMetadataBalanceUpdates[];
  operation_result: OperationResultOrigination;
  internal_operation_results?: InternalOperationResult[];
}

export interface OperationContentsAndResultBallot {
  kind: OpKind.BALLOT;
  source: string;
  period: number;
  proposal: string;
  ballot: OperationContentsBallotEnum;
}

export interface OperationContentsAndResultProposals {
  kind: OpKind.PROPOSALS;
  source: string;
  period: number;
  proposals: string[];
}

export interface OperationContentsAndResultActivateAccount {
  kind: OpKind.ACTIVATION;
  pkh: string;
  secret: string;
  metadata: OperationContentsAndResultMetadata;
}

export interface OperationContentsAndResultDoubleBaking {
  kind: OpKind.DOUBLE_BAKING_EVIDENCE;
  bh1: BlockFullHeader;
  bh2: BlockFullHeader;
  metadata: OperationContentsAndResultMetadata;
}

export interface OperationContentsAndResultDoubleEndorsement {
  kind: OpKind.DOUBLE_ENDORSEMENT_EVIDENCE;
  op1: InlinedEndorsement;
  op2: InlinedEndorsement;
  slot?: number;
  metadata: OperationContentsAndResultMetadata;
}

export interface OperationContentsAndResultRevelation {
  kind: OpKind.SEED_NONCE_REVELATION;
  level: number;
  nonce: string;
  metadata: OperationContentsAndResultMetadata;
}

export interface OperationContentsAndResultMetadata {
  balance_updates: OperationMetadataBalanceUpdates[];
}

export interface OperationContentsAndResultMetadataExtended {
  balance_updates: OperationMetadataBalanceUpdates[];
  delegate: string;
  slots: number[];
}

export interface OperationEntry {
  protocol: string;
  chain_id: string;
  hash: string;
  branch: string;
  contents: (OperationContents | OperationContentsAndResult)[];
  signature?: string;
}

export interface BlockMetadata {
  protocol: string;
  next_protocol: string;
  test_chain_status: TestChainStatus;
  max_operations_ttl: number;
  max_operation_data_length: number;
  max_block_header_length: number;
  max_operation_list_length: MaxOperationListLength[];
  baker: string;
  level?: Level;
  level_info?: LevelInfo;
  voting_period_kind?: string;
  voting_period_info?: VotingPeriodBlockResult;
  nonce_hash?: any;
  consumed_gas: string;
  deactivated: any[];
  balance_updates: OperationBalanceUpdates;
  liquidity_baking_escape_ema?: number;
  implicit_operations_results?: SuccessfulManagerOperationResult[];
}

export type SuccessfulManagerOperationResultKindEnum =
  | OpKind.REVEAL
  | OpKind.TRANSACTION
  | OpKind.ORIGINATION
  | OpKind.DELEGATION;

export interface SuccessfulManagerOperationResult {
  kind: SuccessfulManagerOperationResultKindEnum;
  consumed_gas?: string;
  consumed_milligas?: string;
  storage?: MichelsonV1Expression;
  big_map_diff?: ContractBigMapDiff;
  balance_updates?: OperationBalanceUpdates;
  originated_contracts?: string[];
  storage_size?: string;
  paid_storage_size_diff?: string;
  lazy_storage_diff?: LazyStorageDiff[];
}

export interface VotingPeriodBlockResult {
  voting_period: VotingPeriodResult;
  position: number;
  remaining: number;
}

export interface VotingPeriodResult {
  index: number;
  kind: string;
  start_position: number;
}

export interface LevelInfo {
  level: number;
  level_position: number;
  cycle: number;
  cycle_position: number;
  expected_commitment: boolean;
}

export interface Level {
  level: number;
  level_position: number;
  cycle: number;
  cycle_position: number;
  voting_period: number;
  voting_period_position: number;
  expected_commitment: boolean;
}

export interface MaxOperationListLength {
  max_size: number;
  max_op?: number;
}

export interface TestChainStatus {
  status: string;
}

export interface BlockFullHeader {
  level: number;
  proto: number;
  predecessor: string;
  timestamp: TimeStampMixed;
  validation_pass: number;
  operations_hash: string;
  fitness: string[];
  context: string;
  priority: number;
  proof_of_work_nonce: string;
  seed_nonce_hash?: string;
  signature: string;
}

export interface RPCOptions {
  block: string;
}

export type BalanceResponse = BigNumber;
export type StorageResponse = ScriptedContracts['storage'];
export type ScriptResponse = ScriptedContracts;
export interface ConstantsResponseProto009 extends ConstantsResponseProto007 {}
export interface ConstantsResponseProto008 extends ConstantsResponseProto007 {}
export type UnparsingModeEnum = 'Readable' | 'Optimized' | 'Optimized_legacy';
export type ManagerKeyResponse = string | { key: string };
export type BakingRightsArgumentsDelegate = string | string[];
export type BakingRightsArgumentsCycle = number | number[];
export type BakingRightsArgumentsLevel = number | number[];
export type DelegateResponse = string | null;
export type BigMapGetResponse = MichelsonV1Expression;
export type BigMapResponse = MichelsonV1Expression | MichelsonV1Expression[];
export type Ratio = { numerator: number; denominator: number };
export type UnparsingMode = {
  unparsing_mode: UnparsingModeEnum;
};

export interface DelegatesResponse {
  balance: BigNumber;
  frozen_balance: BigNumber;
  frozen_balance_by_cycle: Frozenbalancebycycle[];
  staking_balance: BigNumber;
  delegated_contracts: string[];
  delegated_balance: BigNumber;
  deactivated: boolean;
  grace_period: number;
  voting_power?: number;
}

interface Frozenbalancebycycle {
  cycle: number;
  deposit?: BigNumber;
  deposits?: BigNumber; // Since Granada, "deposit" is replaced by "deposits"
  fees: BigNumber;
  rewards: BigNumber;
}

export interface ContractResponse {
  balance: BigNumber;
  script: ScriptedContracts;
  counter?: string;
  delegate?: string;
}

export type BigMapKey = {
  key: { [key: string]: string | object[] };
  type: { prim: string; args?: object[] };
};

export interface ConstantsResponseCommon {
  proof_of_work_nonce_size: number;
  nonce_length: number;
  max_operation_data_length: number;
  preserved_cycles: number;
  blocks_per_cycle: number;
  blocks_per_commitment: number;
  blocks_per_roll_snapshot: number;
  blocks_per_voting_period: number;
  time_between_blocks: BigNumber[];
  endorsers_per_block: number;
  hard_gas_limit_per_operation: BigNumber;
  hard_gas_limit_per_block: BigNumber;
  proof_of_work_threshold: BigNumber;
  tokens_per_roll: BigNumber;
  michelson_maximum_type_size: number;
  seed_nonce_revelation_tip: BigNumber;
  block_security_deposit: BigNumber;
  endorsement_security_deposit: BigNumber;
  endorsement_reward: BigNumber | BigNumber[]; // BigNumber[] since proto 006, BigNumber before
  cost_per_byte: BigNumber;
  hard_storage_limit_per_operation: BigNumber;
}

export interface ConstantsResponseProto011 extends ConstantsResponseProto010 {
  max_micheline_node_count?: number;
  max_allowed_global_constants_depth?: number;
  max_micheline_bytes_limit?: number;
  cache_layout?: BigNumber[];
}

export interface ConstantsResponseProto010 extends ConstantsResponseProto007 {
  minimal_block_delay?: BigNumber;
  liquidity_baking_subsidy?: BigNumber;
  liquidity_baking_sunset_level?: number;
  liquidity_baking_escape_ema_threshold?: number;
}

export interface ConstantsResponseProto007
  extends Omit<ConstantsResponseProto006, 'max_revelations_per_block'> {
  max_anon_ops_per_block?: number;
}

export interface ConstantsResponseProto006 extends Omit<ConstantsResponseProto005, 'block_reward'> {
  baking_reward_per_endorsement?: BigNumber[];
}

export interface ConstantsResponseProto005 extends ConstantsResponseProto004 {
  quorum_min?: number;
  quorum_max?: number;
  min_proposal_quorum?: number;
  initial_endorsers?: number;
  delay_per_missing_endorsement?: BigNumber;
}

export interface ConstantsResponseProto004 extends ConstantsResponseProto003 {
  test_chain_duration?: BigNumber;
}

export interface ConstantsResponseProto003
  extends Omit<ConstantsResponseProto001And002, 'origination_burn'> {
  origination_size?: number;
  max_proposals_per_delegate?: number;
}

export interface ConstantsResponseProto001And002 {
  max_revelations_per_block?: number;
  origination_burn?: string;
  block_reward?: BigNumber;
}

export interface ConstantsResponseProto012
  extends Omit<
    ConstantsResponseProto011,
    | 'baking_reward_per_endorsement'
    | 'initial_endorsers'
    | 'delay_per_missing_endorsement'
    | 'test_chain_duration'
    | 'blocks_per_roll_snapshot'
    | 'time_between_blocks'
    | 'endorsers_per_block'
    | 'block_security_deposit'
    | 'endorsement_security_deposit'
    | 'endorsement_reward'
  > {
  blocks_per_stake_snapshot?: number;
  baking_reward_fixed_portion?: BigNumber;
  baking_reward_bonus_per_slot?: BigNumber;
  endorsing_reward_per_slot?: BigNumber;
  max_operations_time_to_live?: number;
  consensus_committee_size?: number;
  consensus_threshold?: number;
  minimal_participation_ratio?: Ratio;
  max_slashing_period?: number;
  frozen_deposits_percentage?: number;
  double_baking_punishment?: BigNumber;
  ratio_of_frozen_deposits_slashed_per_double_endorsement?: Ratio;
  delegate_selection?: 'random' | string[][];
  delay_increment_per_round?: BigNumber;
}

export type ConstantsResponse = ConstantsResponseCommon &
  ConstantsResponseProto012 &
  ConstantsResponseProto011 &
  ConstantsResponseProto010 &
  ConstantsResponseProto009 &
  ConstantsResponseProto008 &
  ConstantsResponseProto007 &
  ConstantsResponseProto006 &
  ConstantsResponseProto005 &
  ConstantsResponseProto004 &
  ConstantsResponseProto003 &
  ConstantsResponseProto001And002;


export interface BlockHeaderResponse {
  protocol: string;
  chain_id: string;
  hash: string;
  level: number;
  proto: number;
  predecessor: string;
  timestamp: string;
  validation_pass: number;
  operations_hash: string;
  fitness: string[];
  context: string;
  priority: number;
  proof_of_work_nonce: string;
  signature: string;
}

export interface BakingRightsQueryArguments {
  level?: BakingRightsArgumentsLevel;
  cycle?: BakingRightsArgumentsCycle;
  delegate?: BakingRightsArgumentsDelegate;
  max_priority?: number;
  all?: null;
}

export interface BakingRightsResponseItem {
  level: number;
  delegate: string;
  priority: number;
  estimated_time?: Date;
}

export interface BallotsResponse {
  yay: number;
  nay: number;
  pass: number;
}

export interface BallotListResponseItem {
  pkh: string;
  ballot: BallotListResponseEnum;
}

export type PeriodKindResponse =
  | 'proposal'
  | 'testing_vote'
  | 'testing'
  | 'promotion_vote'
  | 'exploration'
  | 'cooldown'
  | 'promotion'
  | 'adoption';

export interface VotesListingsResponseItem {
  pkh: string;
  rolls: number;
}

export interface OperationObject {
  branch?: string;
  contents?: OperationContents[];
  protocol?: string;
  signature?: string;
}

export type PreapplyResponse = {
  contents: OperationContentsAndResult[];
};

export type EntrypointsResponse = {
  entrypoints: { [key: string]: MichelsonV1ExpressionExtended };
  unreachable?: { path: ('Left' | 'Right')[] };
};

export interface EndorsingRightsQueryArguments {
  level?: EndorsingRightsArgumentsLevel;
  cycle?: EndorsingRightsArgumentsCycle;
  delegate?: EndorsingRightsArgumentsDelegate;
}

export interface EndorsingRightsResponseItem {
  level: number;
  delegate: string;
  slots: number[];
  estimated_time?: Date;
}

export type RPCRunOperationParam = {
  operation: OperationObject;
  chain_id: string;
};

export type RPCRunCodeParam = {
  script: MichelsonV1ExpressionExtended[];
  storage: MichelsonV1Expression;
  input: MichelsonV1Expression;
  amount: string;
  chain_id: string;
  source?: string;
  payer?: string;
  gas?: BigNumber;
  entrypoint?: string;
  balance?: string;
};

export type RunCodeResult = {
  storage: MichelsonV1Expression;
  operations: InternalOperationResult[];
  big_map_diff?: ContractBigMapDiff;
};

export interface PackDataParams {
  data: MichelsonV1Expression;
  type: MichelsonV1Expression;
  gas?: BigNumber;
}

export type SaplingDiffResponse = {
  root: SaplingTransactionCommitmentHash;
  commitments_and_ciphertexts: CommitmentsAndCiphertexts[];
  nullifiers: string[];
};

export interface ForgeParams {
  branch: string;
  contents: OperationContents[];
}

export type ProtocolsResponse = {
  protocol: string;
  next_protocol: string;
};

export interface Forger {
  forge(params: ForgeParams): Promise<ForgeResponse>;
}

export interface ParserProvider {
    prepareCodeOrigination(params: OriginateParams): Promise<OriginateParams>;
}

export type OriginateParamsBase = {
  balance?: string;
  code: string | object[];
  delegate?: string;
  fee?: number;
  gasLimit?: number;
  storageLimit?: number;
  mutez?: boolean;
};

export type OriginateParams<TStorage = any> = OriginateParamsBase &(
  | {
    init?: never;
    storage: TStorage;
  }
  | {
    init: string | object;
    storage?: never;
  }
);

export interface Injector {
  inject(signedOperationBytes: InjectorParams): Promise<TxHash>;
}

export type ForgeResponse = string;
export type TxHash = string;
export type InjectorParams = string;
export type WalletOriginateParams<TStorage = any> = Omit<OriginateParams<TStorage>, WalletDefinedFields>;
export type WalletDefinedFields = 'source';
export type SaplingTransactionCommitmentHash = string;
export type EndorsingRightsArgumentsDelegate = string | string[];
export type EndorsingRightsArgumentsCycle = number | number[];
export type EndorsingRightsArgumentsLevel = number | number[];
export type BakingRightsResponse = BakingRightsResponseItem[];
export type EndorsingRightsResponse = EndorsingRightsResponseItem[];
export type BallotListResponseEnum = 'nay' | 'yay' | 'pass';
export type BallotListResponse = BallotListResponseItem[];
export type CurrentProposalResponse = string | null;
export type CurrentQuorumResponse = number;
export type VotesListingsResponse = VotesListingsResponseItem[];
export type ProposalsResponse = ProposalsResponseItem[];
export type ProposalsResponseItem = [string, number];
export type ForgeOperationsParams = Pick<OperationObject, 'branch' | 'contents'>;
export type OperationHash = string;
export type PreapplyParams = OperationObject[];
export type WalletDelegateParams = Omit<DelegateParams, WalletDefinedFields>;

export interface DelegateParams {
  source: string;
  delegate?: string;
  fee?: number;
  gasLimit?: number;
  storageLimit?: number;
}

export interface RpcClientInterface {
  getBlockHash(options?: RPCOptions): Promise<string>;
  getLiveBlocks(options?: RPCOptions): Promise<string[]>;
  getBalance(address: string, options?: RPCOptions): Promise<BalanceResponse>;
  getStorage(address: string, options?: RPCOptions): Promise<StorageResponse>;
  getScript(address: string, options?: RPCOptions): Promise<ScriptResponse>;
  getNormalizedScript(
    address: string,
    unparsingMode?: UnparsingMode,
    options?: RPCOptions
  ): Promise<ScriptResponse>;
  getContract(address: string, options?: RPCOptions): Promise<ContractResponse>;
  getManagerKey(address: string, options?: RPCOptions): Promise<ManagerKeyResponse>;
  getDelegate(address: string, options?: RPCOptions): Promise<DelegateResponse>;
  getBigMapKey(address: string, key: BigMapKey, options?: RPCOptions): Promise<BigMapGetResponse>;
  getBigMapExpr(id: string, expr: string, options?: RPCOptions): Promise<BigMapResponse>;
  getDelegates(address: string, options?: RPCOptions): Promise<DelegatesResponse>;
  getConstants(options?: RPCOptions): Promise<ConstantsResponse>;
  getBlock(options?: RPCOptions): Promise<BlockResponse>;
  getBlockHeader(options?: RPCOptions): Promise<BlockHeaderResponse>;
  getBlockMetadata(options?: RPCOptions): Promise<BlockMetadata>;
  getBakingRights(
    args: BakingRightsQueryArguments,
    options?: RPCOptions
  ): Promise<BakingRightsResponse>;
  getEndorsingRights(
    args: EndorsingRightsQueryArguments,
    options?: RPCOptions
  ): Promise<EndorsingRightsResponse>;
  getBallotList(options?: RPCOptions): Promise<BallotListResponse>;
  getBallots(options?: RPCOptions): Promise<BallotsResponse>;
  getCurrentPeriodKind(options?: RPCOptions): Promise<PeriodKindResponse>;
  getCurrentProposal(options?: RPCOptions): Promise<CurrentProposalResponse>;
  getCurrentQuorum(options?: RPCOptions): Promise<CurrentQuorumResponse>;
  getVotesListings(options?: RPCOptions): Promise<VotesListingsResponse>;
  getProposals(options?: RPCOptions): Promise<ProposalsResponse>;
  forgeOperations(data: ForgeOperationsParams, options?: RPCOptions): Promise<string>;
  injectOperation(signedOpBytes: string): Promise<OperationHash>;
  preapplyOperations(ops: PreapplyParams, options?: RPCOptions): Promise<PreapplyResponse[]>;
  getEntrypoints(contract: string, options?: RPCOptions): Promise<EntrypointsResponse>;
  runOperation(op: RPCRunOperationParam, options?: RPCOptions): Promise<PreapplyResponse>;
  runCode(code: RPCRunCodeParam, options?: RPCOptions): Promise<RunCodeResult>;
  getChainId(): Promise<string>;
  packData(
    data: PackDataParams,
    options?: RPCOptions
  ): Promise<{ packed: string; gas: BigNumber | 'unaccounted' | undefined }>;
  getRpcUrl(): string;
  getCurrentPeriod(options?: RPCOptions): Promise<VotingPeriodBlockResult>;
  getSuccessorPeriod(options?: RPCOptions): Promise<VotingPeriodBlockResult>;
  getSaplingDiffById(id: string, options?: RPCOptions): Promise<SaplingDiffResponse>;
  getSaplingDiffByContract(contract: string, options?: RPCOptions): Promise<SaplingDiffResponse>;
  getProtocols(options?: RPCOptions): Promise<ProtocolsResponse>;
}

export interface WalletProvider {
  getPKH: () => Promise<string>;
  mapTransferParamsToWalletParams: (params: () => Promise<WalletTransferParams>) => Promise<any>;
  mapOriginateParamsToWalletParams: (params: () => Promise<WalletOriginateParams>) => Promise<any>;
  mapDelegateParamsToWalletParams: (params: () => Promise<WalletDelegateParams>) => Promise<any>;
  sendOperations: (params: any[]) => Promise<string>;
}

export const cacheUntil =
  <T>(cacheUntilObs: Observable<any>): MonoTypeOperatorFunction<T> =>
  (source) => {
  let subject: ReplaySubject<T> | null = null;

  return defer(() => {
    if (!subject) {
      subject = new ReplaySubject<T>();
      source.pipe(first()).subscribe(subject);
      cacheUntilObs.pipe(first()).subscribe(() => {
        subject = null;
      });
    }
    return subject;
  });
};

export const createNewPollingBasedHeadObservable = (
  pollingTimer: Observable<number>,
  sharedHeadOb: Observable<BlockResponse>,
  context: Context,
  scheduler?: SchedulerLike
): Observable<BlockResponse> => {
  return pollingTimer.pipe(
    switchMap(() => sharedHeadOb),
    distinctUntilKeyChanged('hash'),
    timeoutWith(
      context.config.confirmationPollingTimeoutSecond * 1000,
      throwError(new Error('Confirmation polling timed out')),
      scheduler
    ),
    shareReplay({
      refCount: true,
      scheduler,
    })
  );
};

export class MissedBlockDuringConfirmationError extends Error {
  name = 'MissedBlockDuringConfirmationError';

  constructor() {
    super(
      'Taquito missed a block while waiting for operation confirmation and was not able to find the operation'
    );
  }
}

export interface Receipt {
  totalFee: BigNumber;
  totalGas: BigNumber;
  totalStorage: BigNumber;
  totalAllocationBurn: BigNumber;
  totalOriginationBurn: BigNumber;
  totalPaidStorageDiff: BigNumber;
  totalStorageBurn: BigNumber;
}

export type MergedOperationResult = OperationResultDelegation &
  OperationResultOrigination &
  OperationResultTransaction &
  OperationResultRegisterGlobalConstant &
  OperationResultReveal & {
  fee?: string;
};

export const hasMetadata = <T extends { kind: OpKind }, K>(op: T): op is T & {
  metadata: K;
} => {
  return 'metadata' in op;
};

export const hasMetadataWithResult = <T extends { kind: OpKind }, K>(op: T): op is T & {
  metadata: {
    operation_result: K;
  };
} => {
  return hasMetadata<T, any>(op) && 'operation_result' in op.metadata;
};

export const flattenOperationResult = (response: PreapplyResponse | PreapplyResponse[]) => {
  const results = Array.isArray(response) ? response : [response];

  const returnedResults: MergedOperationResult[] = [];
  for (let i = 0; i < results.length; i++) {
    for (let j = 0; j < results[i].contents.length; j++) {
      const content = results[i].contents[j];
      if (hasMetadataWithResult(content)) {
        returnedResults.push({
          fee: content.fee,
          ...content.metadata.operation_result,
        });

        if (Array.isArray(content.metadata.internal_operation_results)) {
          content.metadata.internal_operation_results.forEach((x) =>
            returnedResults.push(x.result)
          );
        }
      }
    }
  }

  return returnedResults;
};

export const receiptFromOperation = (
  op: OperationContentsAndResult[],
  { ALLOCATION_BURN, ORIGINATION_BURN } = {
    ALLOCATION_BURN: 257,
    ORIGINATION_BURN: 257,
  }
): Receipt => {
  const operationResults = flattenOperationResult({ contents: op });
  let totalGas = new BigNumber(0);
  let totalStorage = new BigNumber(0);
  let totalFee = new BigNumber(0);
  let totalOriginationBurn = new BigNumber(0);
  let totalAllocationBurn = new BigNumber(0);
  let totalPaidStorageDiff = new BigNumber(0);
  operationResults.forEach(result => {
    totalFee = totalFee.plus(result.fee || 0);
    totalOriginationBurn = totalOriginationBurn.plus(
      Array.isArray(result.originated_contracts)
        ? result.originated_contracts.length * ORIGINATION_BURN
        : 0
    );
    totalAllocationBurn = totalAllocationBurn.plus(
      'allocated_destination_contract' in result ? ALLOCATION_BURN : 0
    );
    totalGas = totalGas.plus(result.consumed_gas || 0);
    totalPaidStorageDiff = totalPaidStorageDiff.plus(
      'paid_storage_size_diff' in result ? Number(result.paid_storage_size_diff) || 0 : 0
    );
  });

  totalStorage = totalStorage
    .plus(totalAllocationBurn)
    .plus(totalOriginationBurn)
    .plus(totalPaidStorageDiff);

  return {
    totalFee,
    totalGas,
    totalStorage,
    totalAllocationBurn,
    totalOriginationBurn,
    totalPaidStorageDiff,
    totalStorageBurn: new BigNumber(totalStorage.multipliedBy(1000)),
  };
};

export enum ValidationResult {
  NO_PREFIX_MATCHED,
  INVALID_CHECKSUM,
  INVALID_LENGTH,
  VALID,
}

export enum Prefix {
  TZ1 = 'tz1',
  TZ2 = 'tz2',
  TZ3 = 'tz3',
  KT = 'KT',
  KT1 = 'KT1',

  EDSK2 = 'edsk2',
  SPSK = 'spsk',
  P2SK = 'p2sk',

  EDPK = 'edpk',
  SPPK = 'sppk',
  P2PK = 'p2pk',

  EDESK = 'edesk',
  SPESK = 'spesk',
  P2ESK = 'p2esk',

  EDSK = 'edsk',
  EDSIG = 'edsig',
  SPSIG = 'spsig',
  P2SIG = 'p2sig',
  SIG = 'sig',

  NET = 'Net',
  NCE = 'nce',
  B = 'B',
  O = 'o',
  LO = 'Lo',
  LLO = 'LLo',
  P = 'P',
  CO = 'Co',
  ID = 'id',

  EXPR = 'expr',
  TZ = 'TZ',
}

export function isValidPrefix(value: any): value is Prefix {
  if (typeof value !== 'string') {
    return false;
  }

  return value in prefix;
}

export const prefix = {
  [Prefix.TZ1]: new Uint8Array([6, 161, 159]),
  [Prefix.TZ2]: new Uint8Array([6, 161, 161]),
  [Prefix.TZ3]: new Uint8Array([6, 161, 164]),
  [Prefix.KT]: new Uint8Array([2, 90, 121]),
  [Prefix.KT1]: new Uint8Array([2, 90, 121]),

  [Prefix.EDSK]: new Uint8Array([43, 246, 78, 7]),
  [Prefix.EDSK2]: new Uint8Array([13, 15, 58, 7]),
  [Prefix.SPSK]: new Uint8Array([17, 162, 224, 201]),
  [Prefix.P2SK]: new Uint8Array([16, 81, 238, 189]),

  [Prefix.EDPK]: new Uint8Array([13, 15, 37, 217]),
  [Prefix.SPPK]: new Uint8Array([3, 254, 226, 86]),
  [Prefix.P2PK]: new Uint8Array([3, 178, 139, 127]),

  [Prefix.EDESK]: new Uint8Array([7, 90, 60, 179, 41]),
  [Prefix.SPESK]: new Uint8Array([0x09, 0xed, 0xf1, 0xae, 0x96]),
  [Prefix.P2ESK]: new Uint8Array([0x09, 0x30, 0x39, 0x73, 0xab]),

  [Prefix.EDSIG]: new Uint8Array([9, 245, 205, 134, 18]),
  [Prefix.SPSIG]: new Uint8Array([13, 115, 101, 19, 63]),
  [Prefix.P2SIG]: new Uint8Array([54, 240, 44, 52]),
  [Prefix.SIG]: new Uint8Array([4, 130, 43]),

  [Prefix.NET]: new Uint8Array([87, 82, 0]),
  [Prefix.NCE]: new Uint8Array([69, 220, 169]),
  [Prefix.B]: new Uint8Array([1, 52]),
  [Prefix.O]: new Uint8Array([5, 116]),
  [Prefix.LO]: new Uint8Array([133, 233]),
  [Prefix.LLO]: new Uint8Array([29, 159, 109]),
  [Prefix.P]: new Uint8Array([2, 170]),
  [Prefix.CO]: new Uint8Array([79, 179]),
  [Prefix.ID]: new Uint8Array([153, 103]),

  [Prefix.EXPR]: new Uint8Array([13, 44, 64, 27]),
  // Legacy prefix
  [Prefix.TZ]: new Uint8Array([2, 90, 121]),
};

function validatePrefixedValue(value: any, prefixes: Prefix[]) {
  const match = new RegExp(`^(${prefixes.join('|')})`).exec(value);
  if (!match || match.length === 0) {
    return ValidationResult.NO_PREFIX_MATCHED;
  }

  const prefixKey = match[0];

  if (!isValidPrefix(prefixKey)) {
    return ValidationResult.NO_PREFIX_MATCHED;
  }

  // Remove annotation from contract address before doing the validation
  const contractAddress = /^(KT1\w{33})(%(.*))?/.exec(value);
  if (contractAddress) {
    value = contractAddress[1];
  }

  // decodeUnsafe return undefined if decoding fail
  // let decoded = Bs58check.decodeUnsafe(value);
  // if (!decoded) {
  //   return ValidationResult.INVALID_CHECKSUM;
  // }

  // decoded = decoded.slice(prefix[prefixKey].length);
  // if (decoded.length !== prefixLength[prefixKey]) {
  //   return ValidationResult.INVALID_LENGTH;
  // }

  return ValidationResult.VALID;
}

export const prefixLength: { [key: string]: number } = {
  [Prefix.TZ1]: 20,
  [Prefix.TZ2]: 20,
  [Prefix.TZ3]: 20,
  [Prefix.KT]: 20,
  [Prefix.KT1]: 20,
  [Prefix.EDPK]: 32,
  [Prefix.SPPK]: 33,
  [Prefix.P2PK]: 33,
  [Prefix.EDSIG]: 64,
  [Prefix.SPSIG]: 64,
  [Prefix.P2SIG]: 64,
  [Prefix.SIG]: 64,
  [Prefix.NET]: 4,
  [Prefix.B]: 32,
  [Prefix.P]: 32,
  [Prefix.O]: 32
};

const operationPrefix = [Prefix.O];

export function validateOperation(value: any): ValidationResult {
  return validatePrefixedValue(value, operationPrefix);
}

export class InvalidOperationHashError extends Error {
  public name = 'InvalidOperationHashError';
  constructor(public message: string) {
    super(message)
  }
}

export interface Subscribable<T> {
  subscribe(observer?: PartialObserver<T>): Unsubscribable;
  /** @deprecated Use an observer instead of a complete callback */
  subscribe(next: null | undefined, error: null | undefined, complete: () => void): Unsubscribable;
  /** @deprecated Use an observer instead of an error callback */
  subscribe(next: null | undefined, error: (error: any) => void, complete?: () => void): Unsubscribable;
  /** @deprecated Use an observer instead of a complete callback */
  subscribe(next: (value: T) => void, error: null | undefined, complete: () => void): Unsubscribable;
  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Unsubscribable;
}

export interface Unsubscribable {
  unsubscribe(): void;
}

export declare type InteropObservable<T> = {
    [Symbol.observable]: () => Subscribable<T>;
};

export interface CompletionObserver<T> {
  closed?: boolean;
  next?: (value: T) => void;
  error?: (err: any) => void;
  complete: () => void;
}

export interface ErrorObserver<T> {
  closed?: boolean;
  next?: (value: T) => void;
  error: (err: any) => void;
  complete?: () => void;
}

export interface NextObserver<T> {
    closed?: boolean;
    next: (value: T) => void;
    error?: (err: any) => void;
    complete?: () => void;
}

const MAX_BRANCH_ANCESTORS = 60;

export declare function combineLatest<O1 extends ObservableInput<any>>(sources: [O1]): Observable<[ObservedValueOf<O1>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>>(sources: [O1, O2]): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>>(sources: [O1, O2, O3]): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>>(sources: [O1, O2, O3, O4]): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>>(sources: [O1, O2, O3, O4, O5]): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, O6 extends ObservableInput<any>>(sources: [O1, O2, O3, O4, O5, O6]): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>, ObservedValueOf<O6>]>;
export declare type SubscribableOrPromise<T> = Subscribable<T> | Subscribable<never> | PromiseLike<T> | InteropObservable<T>;
export declare function combineLatest<O extends ObservableInput<any>>(sources: O[]): Observable<ObservedValueOf<O>[]>;
export declare type PartialObserver<T> = NextObserver<T> | ErrorObserver<T> | CompletionObserver<T>;
export declare type ObservableInput<T> = SubscribableOrPromise<T> | ArrayLike<T> | Iterable<T>;
export declare type ObservedValueOf<O> = O extends ObservableInput<infer T> ? T : never;

export class WalletOperation {
  protected _operationResult = new ReplaySubject<OperationContentsAndResult[]>(1);
  protected _includedInBlock = new ReplaySubject<BlockResponse>(1);
  protected _included = false;

  private lastHead: BlockResponse | undefined;
  protected newHead$: Observable<BlockResponse> = this._newHead$.pipe(
    tap((newHead) => {
      if (
        !this._included &&
        this.lastHead &&
        newHead.header.level - this.lastHead.header.level > 1
      ) {
        throw new MissedBlockDuringConfirmationError();
      }

      this.lastHead = newHead;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Observable that emit once operation is seen in a block
  private confirmed$ = this.newHead$.pipe(
    map((head) => {
      for (const opGroup of head.operations) {
        for (const op of opGroup) {
          if (op.hash === this.opHash) {
            this._included = true;
            this._includedInBlock.next(head);
            this._operationResult.next(op.contents as OperationContentsAndResult[]);

            // Return the block where the operation was found
            return head;
          }
        }
      }
    }),
    filter<BlockResponse | undefined, BlockResponse>((x): x is BlockResponse => {
      return typeof x !== 'undefined';
    }),
    first(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  async operationResults() {
    return this._operationResult.pipe(first()).toPromise();
  }

  /**
   * @description Receipt expose the total amount of tezos token burn and spent on fees
   * The promise returned by receipt will resolve only once the transaction is included
   */
  async receipt(): Promise<Receipt> {
    return receiptFromOperation(await this.operationResults());
  }

  /**
   *
   * @param opHash Operation hash
   * @param raw Raw operation that was injected
   * @param context Taquito context allowing access to rpc and signer
   */
  constructor(
    public readonly opHash: string,
    protected readonly context: Context,
    private _newHead$: Observable<BlockResponse>
  ) {
    if (validateOperation(this.opHash) !== ValidationResult.VALID) {
      throw new InvalidOperationHashError(`Invalid operation hash: ${this.opHash}`);
    }
    this.confirmed$
      .pipe(
        first(),
        catchError(() => of(undefined))
      )
      .subscribe();
  }

  async getCurrentConfirmation() {
    if (!this._included) {
      return 0;
    }

    return combineLatest([this._includedInBlock, from(this.context.rpc.getBlock())])
      .pipe(
        map(([foundAtBlock, head]) => {
          return head.header.level - foundAtBlock.header.level + 1;
        }),
        first()
      )
      .toPromise();
  }

  async isInCurrentBranch(tipBlockIdentifier = 'head') {
    // By default it is assumed that the operation is in the current branch
    if (!this._included) {
      return true;
    }

    const tipBlockHeader = await this.context.rpc.getBlockHeader({ block: tipBlockIdentifier });
    const inclusionBlock = await this._includedInBlock.pipe(first()).toPromise();

    const levelDiff = tipBlockHeader.level - inclusionBlock.header.level;

    // Block produced before the operation is included are assumed to be part of the current branch
    if (levelDiff <= 0) {
      return true;
    }

    const tipBlockLevel = Math.min(
      inclusionBlock.header.level + levelDiff,
      inclusionBlock.header.level + MAX_BRANCH_ANCESTORS
    );

    const blocks = new Set(await this.context.rpc.getLiveBlocks({ block: String(tipBlockLevel) }));
    return blocks.has(inclusionBlock.hash);
  }

  confirmationObservable(confirmations?: number) {
    if (typeof confirmations !== 'undefined' && confirmations < 1) {
      throw new Error('Confirmation count must be at least 1');
    }

    const { defaultConfirmationCount } = this.context.config;

    const conf = confirmations !== undefined ? confirmations : defaultConfirmationCount;

    if (conf === undefined) {
      throw new Error('Default confirmation count can not be undefined!');
    }

    return combineLatest([this._includedInBlock, this.newHead$]).pipe(
      distinctUntilChanged(([, previousHead], [, newHead]) => {
        return previousHead.hash === newHead.hash;
      }),
      map(([foundAtBlock, head]) => {
        return {
          block: head,
          expectedConfirmation: conf,
          currentConfirmation: head.header.level - foundAtBlock.header.level + 1,
          completed: head.header.level - foundAtBlock.header.level >= conf - 1,
          isInCurrentBranch: () => this.isInCurrentBranch(head.hash),
        };
      }),
      takeWhile(({ completed }) => !completed, true)
    );
  }

  confirmation(confirmations?: number) {
    return this.confirmationObservable(confirmations).toPromise();
  }
}

export const BATCH_KINDS = [
  OpKind.ACTIVATION,
  OpKind.ORIGINATION,
  OpKind.TRANSACTION,
  OpKind.DELEGATION,
];

export class BatchWalletOperation extends WalletOperation {
  constructor(
    public readonly opHash: string,
    protected readonly context: Context,
    newHead$: Observable<BlockResponse>
  ) {
    super(opHash, context, newHead$);
  }

  public async revealOperation() {
    const operationResult = await this.operationResults();
    return operationResult.find(x => x.kind === OpKind.REVEAL) as
      | OperationContentsAndResultReveal
      | undefined;
  }

  async status(): Promise<OperationStatus> {
    if (!this._included) {
      return 'pending';
    }

    const op = await this.operationResults();

    return (
      op
        .filter((result) => BATCH_KINDS.indexOf(result.kind) !== -1)
        .map((result) => {
          if (hasMetadataWithResult(result)) {
            return result.metadata.operation_result.status;
          } else {
            return 'unknown';
          }
        })[0] || 'unknown'
    );
  }
}

export class DelegationWalletOperation extends WalletOperation {
  constructor(
    public readonly opHash: string,
    protected readonly context: Context,
    newHead$: Observable<BlockResponse>
  ) {
    super(opHash, context, newHead$);
  }

  public async revealOperation() {
    const operationResult = await this.operationResults();
    return operationResult.find(x => x.kind === OpKind.REVEAL) as
      | OperationContentsAndResultReveal
      | undefined;
  }

  public async delegationOperation() {
    const operationResult = await this.operationResults();
    return operationResult.find(x => x.kind === OpKind.DELEGATION) as
      | OperationContentsAndResultReveal
      | undefined;
  }

  public async status(): Promise<OperationStatus> {
    if (!this._included) {
      return 'pending';
    }

    const op = await this.delegationOperation();
    if (!op) {
      return 'unknown';
    }

    return op.metadata.operation_result.status;
  }
}

export class OperationFactory {
  constructor(private context: Context) {}

  // Cache the last block for one second across all operations
  private sharedHeadObs = defer(() => from(this.context.rpc.getBlock())).pipe(
    cacheUntil(timer(0, 1000))
  );

  private async createNewHeadObservable() {
    const confirmationPollingIntervalSecond =
      this.context.config.confirmationPollingIntervalSecond !== undefined
        ? this.context.config.confirmationPollingIntervalSecond
        : await this.context.getConfirmationPollingInterval();
    return createNewPollingBasedHeadObservable(
      timer(0, confirmationPollingIntervalSecond * 1000),
      this.sharedHeadObs,
      this.context
    );
  }

  private createPastBlockWalker(startBlock: string, count = 1) {
    return from(this.context.rpc.getBlock({ block: startBlock })).pipe(
      switchMap((block) => {
        if (count === 1) {
          return of(block);
        }

        return range(block.header.level, count - 1).pipe(
          startWith(block),
          concatMap(async (level) => {
            return this.context.rpc.getBlock({ block: String(level) });
          })
        );
      })
    );
  }

  private async createHeadObservableFromConfig({ blockIdentifier }: OperationFactoryConfig) {
    const observableSequence: Observable<BlockResponse>[] = [];

    if (blockIdentifier) {
      observableSequence.push(this.createPastBlockWalker(blockIdentifier));
    }

    observableSequence.push(await this.createNewHeadObservable());

    return concat(...observableSequence);
  }

  async createOperation(
    hash: string,
    config: OperationFactoryConfig = {}
  ): Promise<WalletOperation> {
    return new WalletOperation(
      hash,
      this.context.clone(),
      await this.createHeadObservableFromConfig(config)
    );
  }

  async createBatchOperation(
    hash: string,
    config: OperationFactoryConfig = {}
  ): Promise<BatchWalletOperation> {
    return new BatchWalletOperation(
      hash,
      this.context.clone(),
      await this.createHeadObservableFromConfig(config)
    );
  }

  async createTransactionOperation(
    hash: string,
    config: OperationFactoryConfig = {}
  ): Promise<TransactionWalletOperation> {
    return new TransactionWalletOperation(
      hash,
      this.context.clone(),
      await this.createHeadObservableFromConfig(config)
    );
  }

  async createDelegationOperation(
    hash: string,
    config: OperationFactoryConfig = {}
  ): Promise<DelegationWalletOperation> {
    return new DelegationWalletOperation(
      hash,
      this.context.clone(),
      await this.createHeadObservableFromConfig(config)
    );
  }

  async createOriginationOperation(
    hash: string,
    config: OperationFactoryConfig = {}
  ): Promise<OriginationWalletOperation> {
    return new OriginationWalletOperation(
      hash,
      this.context.clone(),
      await this.createHeadObservableFromConfig(config)
    );
  }
}

export type TokenFactory = (val: any, idx: number) => Token;

export type BaseTokenSchema = {
  __michelsonType:
    | 'address'
    | 'bool'
    | 'bytes'
    | 'int'
    | 'key'
    | 'key_hash'
    | 'mutez'
    | 'nat'
    | 'string'
    | 'timestamp'
    | 'bls12_381_fr'
    | 'bls12_381_g1'
    | 'bls12_381_g2'
    | 'chain_id'
    | 'never'
    | 'operation'
    | 'chest'
    | 'chest_key'
    | 'signature'
    | 'unit';
  schema: string;
};

export type OrTokenSchema = { __michelsonType: 'or'; schema: Record<string, TokenSchema> };
export type PairTokenSchema = { __michelsonType: 'pair'; schema: Record<string, TokenSchema> };
export type ListTokenSchema = { __michelsonType: 'list'; schema: TokenSchema };
export type SetTokenSchema = { __michelsonType: 'set'; schema: TokenSchema };
export type OptionTokenSchema = { __michelsonType: 'option'; schema: TokenSchema };
export type MapTokenSchema = {
  __michelsonType: 'map';
  schema: { key: TokenSchema; value: TokenSchema };
};
export type BigMapTokenSchema = {
  __michelsonType: 'big_map';
  schema: { key: TokenSchema; value: TokenSchema };
};
export type ConstantTokenSchema = { __michelsonType: 'constant'; schema: { hash: string } };
export type ContractTokenSchema = { __michelsonType: 'contract'; schema: { parameter: TokenSchema } };
export type LambdaTokenSchema = {
  __michelsonType: 'lambda';
  schema: { parameters: TokenSchema; returns: TokenSchema };
};
export type SaplingStateTokenSchema = {
  __michelsonType: 'sapling_state';
  schema: { memoSize: string };
};
export type SaplingTransactionTokenSchema = {
  __michelsonType: 'sapling_transaction';
  schema: { memoSize: string };
};
export type TicketTokenSchema = {
  __michelsonType: 'ticket';
  schema: {
    value: TokenSchema;
    ticketer: { __michelsonType: 'contract'; schema: 'contract' };
    amount: { __michelsonType: 'int'; schema: 'int' };
  };
};

export type TokenSchema =
  | BaseTokenSchema
  | OrTokenSchema
  | PairTokenSchema
  | ListTokenSchema
  | SetTokenSchema
  | OptionTokenSchema
  | MapTokenSchema
  | BigMapTokenSchema
  | ConstantTokenSchema
  | ContractTokenSchema
  | LambdaTokenSchema
  | SaplingStateTokenSchema
  | SaplingTransactionTokenSchema
  | TicketTokenSchema;

export abstract class Token {
  constructor(
    protected val: { prim: string; args?: any[]; annots?: any[] },
    protected idx: number,
    protected fac: TokenFactory
  ) {}

  protected typeWithoutAnnotations() {
    const removeArgsRec = (val: Token['val']): { prim: string; args?: any[] } => {
      if (val.args) {
        return {
          prim: val.prim,
          args: val.args.map((x) => removeArgsRec(x)),
        };
      } else {
        return {
          prim: val.prim,
        };
      }
    };

    return removeArgsRec(this.val);
  }

  annot() {
    return (
      Array.isArray(this.val.annots) && this.val.annots.length > 0
        ? this.val.annots[0]
        : String(this.idx)
    ).replace(/(%|:)(_Liq_entry_)?/, '');
  }

  hasAnnotations() {
    return Array.isArray(this.val.annots) && this.val.annots.length;
  }

  get tokenVal() {
    return this.val;
  }

  public createToken = this.fac;

  /**
   * @deprecated ExtractSchema has been deprecated in favor of generateSchema
   *
   */
  public abstract ExtractSchema(): any;

  abstract generateSchema(): TokenSchema;

  public abstract Execute(val: any, semantics?: Semantic): any;

  // public abstract Encode(_args: any[]): any;

  // public abstract EncodeObject(args: any): any;

  public ExtractSignature() {
    return [[this.ExtractSchema()]];
  }

  abstract findAndReturnTokens(tokenToFind: string, tokens: Array<Token>): Array<Token>;
}

export interface Semantic {
  [key: string]: (value: MichelsonV1Expression, schema: MichelsonV1Expression) => any;
}
const schemaTypeSymbol = Symbol.for('taquito-schema-type-symbol');

export abstract class ComparableToken extends Token {
  // abstract ToBigMapKey(val: BigMapKeyType): {
  //   key: { [key: string]: string | object[] };
  //   type: { prim: string; args?: object[] };
  // };

  abstract ToKey(val: string): any;

  compare(o1: string, o2: string): number {
    if (o1 === o2) {
      return 0;
    }

    return o1 < o2 ? -1 : 1;
  }
}

export type BigMapKeyType = string | number | object;

export abstract class TokenValidationError extends Error {
  name = 'ValidationError';

  constructor(public value: any, public token: Token, baseMessage: string) {
    super();
    const annot = this.token.annot();
    const annotText = annot ? `[${annot}] ` : '';
    this.message = `${annotText}${baseMessage}`;
  }
}

export class BigMapValidationError extends TokenValidationError {
  name = 'BigMapValidationError';
  constructor(public value: any, public token: BigMapToken, message: string) {
    super(value, token, message);
  }
}
export type MichelsonMapKey = Array<any> | object | string | boolean | number;
const michelsonMapTypeSymbol = Symbol.for('taquito-michelson-map-type-symbol');
const isMapType = (
  value: MichelsonV1Expression
): value is { prim: 'map' | 'big_map'; args: [MichelsonV1Expression, MichelsonV1Expression] } => {
  return 'args' in value && Array.isArray(value.args) && value.args.length === 2;
};

export class MapTypecheckError extends Error {
  name = 'MapTypecheckError';

  constructor(public readonly value: any, public readonly type: any, errorType: 'key' | 'value') {
    super(`${errorType} not compliant with underlying michelson type`);
  }
};

function stringify(obj: any): string {
	return (JSON.stringify(obj) || 'undefined').replace(/[\u2028\u2029]/g, char => `\\u${('000' + char.charCodeAt(0).toString(16)).slice(-4)}`);
}

export class MichelsonMap<K extends MichelsonMapKey, T> {
  private valueMap = new Map<string, T>();
  private keyMap = new Map<string, K>();

  public [michelsonMapTypeSymbol] = true;

  // Used to check if an object is a michelson map.
  // Using instanceof was not working for project that had multiple instance of taquito dependencies
  // as the class constructor is different
  static isMichelsonMap(obj: any): obj is MichelsonMap<any, any> {
    return obj && obj[michelsonMapTypeSymbol] === true;
  }

  private keySchema?: Schema;
  private valueSchema?: Schema;

  /**
   * @param mapType If specified key and value will be type-checked before being added to the map
   *
   * @example new MichelsonMap({ prim: "map", args: [{prim: "string"}, {prim: "int"}]})
   */
  constructor(mapType?: MichelsonV1Expression) {
    if (mapType) {
      this.setType(mapType);
    }
  }

  setType(mapType: MichelsonV1Expression) {
    if (!isMapType(mapType)) {
      throw new Error('mapType is not a valid michelson map type');
    }

    this.keySchema = new Schema(mapType.args[0]);
    this.valueSchema = new Schema(mapType.args[1]);
  }

  removeType() {
    this.keySchema = undefined;
    this.valueSchema = undefined;
  }

  static fromLiteral(obj: { [key: string]: any }, mapType?: MichelsonV1Expression) {
    const map = new MichelsonMap(mapType);
    Object.keys(obj).forEach((key) => {
      map.set(key, obj[key]);
    });
    return map;
  }

  private typecheckKey(key: K) {
    if (this.keySchema) {
      return this.keySchema.Typecheck(key);
    }

    return true;
  }

  private typecheckValue(value: T) {
    if (this.valueSchema) {
      return this.valueSchema.Typecheck(value);
    }

    return true;
  }

  private assertTypecheckValue(value: T) {
    if (!this.typecheckValue(value)) {
      throw new MapTypecheckError(value, this.valueSchema, 'value');
    }
  }

  private assertTypecheckKey(key: K) {
    if (!this.typecheckKey(key)) {
      throw new MapTypecheckError(key, this.keySchema, 'key');
    }
  }

  private serializeDeterministically(key: K): string {
    return stringify(key);
  }

  *keys(): Generator<K> {
    for (const [key] of this.entries()) {
      yield key;
    }
  }

  *values(): Generator<T> {
    for (const [, value] of this.entries()) {
      yield value;
    }
  }

  *entries(): Generator<[K, T]> {
    for (const key of this.valueMap.keys()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      yield [this.keyMap.get(key)!, this.valueMap.get(key)!];
    }
  }

  get(key: K): T | undefined {
    this.assertTypecheckKey(key);

    const strKey = this.serializeDeterministically(key);
    return this.valueMap.get(strKey);
  }

  /**
   *
   * @description Set a key and a value in the MichelsonMap. If the key already exists, override the current value.
   *
   * @example map.set("myKey", "myValue") // Using a string as key
   *
   * @example map.set({0: "test", 1: "test1"}, "myValue") // Using a pair as key
   *
   * @warn The same key can be represented in multiple ways, depending on the type of the key. This duplicate key situation will cause a runtime error (duplicate key) when sending the map data to the Tezos RPC node.
   *
   * For example, consider a contract with a map whose key is of type boolean.  If you set the following values in MichelsonMap: map.set(false, "myValue") and map.set(null, "myValue").
   *
   * You will get two unique entries in the MichelsonMap. These values will both be evaluated as falsy by the MichelsonEncoder and ultimately rejected by the Tezos RPC.
   */
  set(key: K, value: T) {
    this.assertTypecheckKey(key);
    this.assertTypecheckValue(value);

    const strKey = this.serializeDeterministically(key);
    this.keyMap.set(strKey, key);
    this.valueMap.set(strKey, value);
  }

  delete(key: K) {
    this.assertTypecheckKey(key);

    this.keyMap.delete(this.serializeDeterministically(key));
    this.valueMap.delete(this.serializeDeterministically(key));
  }

  has(key: K) {
    this.assertTypecheckKey(key);

    const strKey = this.serializeDeterministically(key);
    return this.keyMap.has(strKey) && this.valueMap.has(strKey);
  }

  clear(): void {
    this.keyMap.clear();
    this.valueMap.clear();
  }

  get size() {
    return this.keyMap.size;
  }

  forEach(cb: (value: T, key: K, map: MichelsonMap<K, T>) => void) {
    for (const [key, value] of this.entries()) {
      cb(value, key, this);
    }
  }
}

export class BigMapToken extends Token {
  static prim: 'big_map' = 'big_map';
  constructor(
    protected val: { prim: string; args: any[]; annots?: any[] },
    protected idx: number,
    protected fac: TokenFactory
  ) {
    super(val, idx, fac);
  }

  get ValueSchema() {
    return this.createToken(this.val.args[1], 0);
  }

  get KeySchema(): ComparableToken {
    return this.createToken(this.val.args[0], 0) as unknown as ComparableToken;
  }

  /**
   * @deprecated ExtractSchema has been deprecated in favor of generateSchema
   *
   */
  public ExtractSchema() {
    return {
      big_map: {
        key: this.KeySchema.ExtractSchema(),
        value: this.ValueSchema.ExtractSchema(),
      },
    };
  }

  generateSchema(): BigMapTokenSchema {
    return {
      __michelsonType: BigMapToken.prim,
      schema: {
        key: this.KeySchema.generateSchema(),
        value: this.ValueSchema.generateSchema(),
      },
    };
  }

  private isValid(value: any): BigMapValidationError | null {
    if (MichelsonMap.isMichelsonMap(value)) {
      return null;
    }

    return new BigMapValidationError(value, this, 'Value must be a MichelsonMap');
  }

  // public Encode(args: any[]): any {
  //   const val: MichelsonMap<any, any> = args.pop();

  //   const err = this.isValid(val);
  //   if (err) {
  //     throw err;
  //   }

  //   return Array.from(val.keys())
  //     .sort((a: any, b: any) => this.KeySchema.compare(a, b))
  //     .map((key) => {
  //       return {
  //         prim: 'Elt',
  //         args: [this.KeySchema.EncodeObject(key), this.ValueSchema.EncodeObject(val.get(key))],
  //       };
  //     });
  // }

  // public EncodeObject(args: any): any {
  //   const val: MichelsonMap<any, any> = args;

  //   const err = this.isValid(val);
  //   if (err) {
  //     throw err;
  //   }

  //   return Array.from(val.keys())
  //     .sort((a: any, b: any) => this.KeySchema.compare(a, b))
  //     .map((key) => {
  //       return {
  //         prim: 'Elt',
  //         args: [this.KeySchema.EncodeObject(key), this.ValueSchema.EncodeObject(val.get(key))],
  //       };
  //     });
  // }

  public Execute(val: any[] | { int: string }, semantic?: Semantic) {
    if (semantic && semantic[BigMapToken.prim]) {
      return semantic[BigMapToken.prim](val as any, this.val);
    }

    if (Array.isArray(val)) {
      // Athens is returning an empty array for big map in storage
      // Internal: In taquito v5 it is still used to decode big map diff (as if they were a regular map)
      const map = new MichelsonMap(this.val);
      val.forEach((current) => {
        map.set(this.KeySchema.ToKey(current.args[0]), this.ValueSchema.Execute(current.args[1]));
      });
      return map;
    } else if ('int' in val) {
      // Babylon is returning an int with the big map id in contract storage
      return val.int;
    } else {
      // Unknown case
      throw new Error(
        `Big map is expecting either an array (Athens) or an object with an int property (Babylon). Got ${JSON.stringify(
          val
        )}`
      );
    }
  }

  findAndReturnTokens(tokenToFind: string, tokens: Token[]) {
    if (BigMapToken.prim === tokenToFind) {
      tokens.push(this);
    }
    this.KeySchema.findAndReturnTokens(tokenToFind, tokens);
    this.ValueSchema.findAndReturnTokens(tokenToFind, tokens);
    return tokens;
  }
}
export type Falsy<T> = T | undefined | false;

export class OrToken extends ComparableToken {
  static prim: 'or' = 'or';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number,
    protected fac: TokenFactory
  ) {
    super(val, idx, fac);
  }

  // public Encode(args: any[]): any {
  //   const label = args[args.length - 1];

  //   const leftToken = this.createToken(this.val.args[0], this.idx);
  //   let keyCount = 1;
  //   if (leftToken instanceof OrToken) {
  //     keyCount = Object.keys(leftToken.ExtractSchema()).length;
  //   }

  //   const rightToken = this.createToken(this.val.args[1], this.idx + keyCount);

  //   if (String(leftToken.annot()) === String(label) && !(leftToken instanceof OrToken)) {
  //     args.pop();
  //     return { prim: 'Left', args: [leftToken.Encode(args)] };
  //   } else if (String(rightToken.annot()) === String(label) && !(rightToken instanceof OrToken)) {
  //     args.pop();
  //     return { prim: 'Right', args: [rightToken.Encode(args)] };
  //   } else {
  //     if (leftToken instanceof OrToken) {
  //       const val = leftToken.Encode(args);
  //       if (val) {
  //         return { prim: 'Left', args: [val] };
  //       }
  //     }

  //     if (rightToken instanceof OrToken) {
  //       const val = rightToken.Encode(args);
  //       if (val) {
  //         return { prim: 'Right', args: [val] };
  //       }
  //     }
  //     return null;
  //   }
  // }

  public ExtractSignature(): any {
    const leftToken = this.createToken(this.val.args[0], this.idx);
    let keyCount = 1;
    if (leftToken instanceof OrToken) {
      keyCount = Object.keys(leftToken.ExtractSchema()).length;
    }

    const rightToken = this.createToken(this.val.args[1], this.idx + keyCount);

    const newSig = [];

    if (leftToken instanceof OrToken) {
      newSig.push(...leftToken.ExtractSignature());
    } else {
      for (const sig of leftToken.ExtractSignature()) {
        newSig.push([leftToken.annot(), ...sig]);
      }
    }

    if (rightToken instanceof OrToken) {
      newSig.push(...rightToken.ExtractSignature());
    } else {
      for (const sig of rightToken.ExtractSignature()) {
        newSig.push([rightToken.annot(), ...sig]);
      }
    }

    return newSig;
  }

  // public EncodeObject(args: any): any {
  //   const label = Object.keys(args)[0];

  //   const leftToken = this.createToken(this.val.args[0], this.idx);
  //   let keyCount = 1;
  //   if (leftToken instanceof OrToken) {
  //     keyCount = Object.keys(leftToken.ExtractSchema()).length;
  //   }

  //   const rightToken = this.createToken(this.val.args[1], this.idx + keyCount);

  //   if (String(leftToken.annot()) === String(label) && !(leftToken instanceof OrToken)) {
  //     return { prim: 'Left', args: [leftToken.EncodeObject(args[label])] };
  //   } else if (String(rightToken.annot()) === String(label) && !(rightToken instanceof OrToken)) {
  //     return { prim: 'Right', args: [rightToken.EncodeObject(args[label])] };
  //   } else {
  //     if (leftToken instanceof OrToken) {
  //       const val = leftToken.EncodeObject(args);
  //       if (val) {
  //         return { prim: 'Left', args: [val] };
  //       }
  //     }

  //     if (rightToken instanceof OrToken) {
  //       const val = rightToken.EncodeObject(args);
  //       if (val) {
  //         return { prim: 'Right', args: [val] };
  //       }
  //     }
  //     return null;
  //   }
  // }

  public Execute(val: any, semantics?: Semantic): any {
    const leftToken = this.createToken(this.val.args[0], this.idx);
    let keyCount = 1;
    if (leftToken instanceof OrToken) {
      keyCount = Object.keys(leftToken.ExtractSchema()).length;
    }
    const rightToken = this.createToken(this.val.args[1], this.idx + keyCount);

    if (val.prim === 'Right') {
      if (rightToken instanceof OrToken) {
        return rightToken.Execute(val.args[0], semantics);
      } else {
        return {
          [rightToken.annot()]: rightToken.Execute(val.args[0], semantics),
        };
      }
    } else if (val.prim === 'Left') {
      if (leftToken instanceof OrToken) {
        return leftToken.Execute(val.args[0], semantics);
      }
      return {
        [leftToken.annot()]: leftToken.Execute(val.args[0], semantics),
      };
    } else {
      throw new Error(`Was expecting Left or Right prim but got: ${val.prim}`);
    }
  }

  private traversal(
    getLeftValue: (token: Token) => any,
    getRightValue: (token: Token) => any,
    concat: (left: any, right: any) => any
  ) {
    const leftToken = this.createToken(this.val.args[0], this.idx);
    let keyCount = 1;
    let leftValue;
    if (leftToken instanceof OrToken && !leftToken.hasAnnotations()) {
      leftValue = getLeftValue(leftToken);
      keyCount = Object.keys(leftToken.ExtractSchema()).length;
    } else {
      leftValue = { [leftToken.annot()]: getLeftValue(leftToken) };
    }

    const rightToken = this.createToken(this.val.args[1], this.idx + keyCount);
    let rightValue;
    if (rightToken instanceof OrToken && !rightToken.hasAnnotations()) {
      rightValue = getRightValue(rightToken);
    } else {
      rightValue = { [rightToken.annot()]: getRightValue(rightToken) };
    }

    const res = concat(leftValue, rightValue);

    return res;
  }

  /**
   * @deprecated ExtractSchema has been deprecated in favor of generateSchema
   *
   */
  public ExtractSchema(): any {
    return this.traversal(
      (leftToken) => leftToken.ExtractSchema(),
      (rightToken) => rightToken.ExtractSchema(),
      (leftValue, rightValue) => ({
        ...leftValue,
        ...rightValue,
      })
    );
  }

  generateSchema(): OrTokenSchema {
    return {
      __michelsonType: OrToken.prim,
      schema: this.traversal(
        (leftToken) => {
          if (leftToken instanceof OrToken && !leftToken.hasAnnotations()) {
            return leftToken.generateSchema().schema;
          } else {
            return leftToken.generateSchema();
          }
        },
        (rightToken) => {
          if (rightToken instanceof OrToken && !rightToken.hasAnnotations()) {
            return rightToken.generateSchema().schema;
          } else {
            return rightToken.generateSchema();
          }
        },
        (leftValue, rightValue) => ({
          ...leftValue,
          ...rightValue,
        })
      ),
    };
  }

  private findToken(label: any): Token | null {
    const leftToken = this.createToken(this.val.args[0], this.idx);
    let keyCount = 1;
    if (leftToken instanceof OrToken) {
      keyCount = Object.keys(leftToken.ExtractSchema()).length;
    }

    const rightToken = this.createToken(this.val.args[1], this.idx + keyCount);

    if (
      String(leftToken.annot()) === String(label) &&
      !(leftToken instanceof OrToken) &&
      leftToken instanceof ComparableToken
    ) {
      return leftToken;
    } else if (
      String(rightToken.annot()) === String(label) &&
      !(rightToken instanceof OrToken) &&
      rightToken instanceof ComparableToken
    ) {
      return rightToken;
    } else {
      if (leftToken instanceof OrToken) {
        const tok = leftToken.findToken(label);
        if (tok) {
          return tok;
        }
      }

      if (rightToken instanceof OrToken) {
        const tok = rightToken.findToken(label);
        if (tok) {
          return tok;
        }
      }
      return null;
    }
  }

  compare(val1: any, val2: any): any {
    const labelVal1 = Object.keys(val1)[0];
    const labelVal2 = Object.keys(val2)[0];

    if (labelVal1 === labelVal2) {
      const token = this.findToken(labelVal1);
      if (token instanceof ComparableToken) {
        return token.compare(val1[labelVal1], val2[labelVal1]);
      }
    } else {
      const encoded1 = JSON.stringify(this.EncodeObject(val1));
      const encoded2 = JSON.stringify(this.EncodeObject(val2));
      return encoded1 < encoded2 ? -1 : 1;
    }
  }

  public ToKey(val: any) {
    return this.Execute(val);
  }

  public ToBigMapKey(val: any) {
    return {
      key: this.EncodeObject(val),
      type: this.typeWithoutAnnotations(),
    };
  }

  findAndReturnTokens(tokenToFind: string, tokens: Token[]) {
    if (OrToken.prim === tokenToFind) {
      tokens.push(this);
    }
    this.traversal(
      (leftToken) => leftToken.findAndReturnTokens(tokenToFind, tokens),
      (rightToken) => rightToken.findAndReturnTokens(tokenToFind, tokens),
      (leftValue, rightValue) => ({
        ...leftValue,
        ...rightValue,
      })
    );
    return tokens;
  }
}
function collapse(val: Token['val'] | any[], prim: string = PairToken.prim): [any, any] {
  if (Array.isArray(val)) {
    return collapse(
      {
        prim: prim,
        args: val,
      },
      prim
    );
  }
  if (val.args === undefined) {
    throw new Error('Token has no arguments');
  }
  if (val.args.length > 2) {
    return [
      val.args[0],
      {
        prim: prim,
        args: val.args.slice(1),
      },
    ];
  }
  return [val.args[0], val.args[1]];
}
export class PairToken extends ComparableToken {
  static prim: 'pair' = 'pair';

  constructor(
    val: { prim: string; args: any[]; annots: any[] } | any[],
    idx: number,
    fac: TokenFactory
  ) {
    super(
      Array.isArray(val)
        ? {
            prim: PairToken.prim,
            args: val,
          }
        : val,
      idx,
      fac
    );
  }

  private args(): [any, any] {
    // collapse comb pair
    return collapse(this.val);
  }

  private tokens(): [Token, Token] {
    let cnt = 0;
    return this.args().map((a) => {
      const tok = this.createToken(a, this.idx + cnt);
      if (tok instanceof PairToken) {
        cnt += Object.keys(tok.ExtractSchema()).length;
      } else {
        cnt++;
      }
      return tok;
    }) as [Token, Token];
  }

  // public Encode(args: any[]): any {
  //   return {
  //     prim: 'Pair',
  //     args: this.tokens().map((t) => t.Encode(args)),
  //   };
  // }

  public ExtractSignature(): any {
    const args = this.args();
    const leftToken = this.createToken(args[0], this.idx);
    let keyCount = 1;
    if (leftToken instanceof OrToken) {
      keyCount = Object.keys(leftToken.ExtractSchema()).length;
    }

    const rightToken = this.createToken(args[1], this.idx + keyCount);

    const newSig = [];

    for (const leftSig of leftToken.ExtractSignature()) {
      for (const rightSig of rightToken.ExtractSignature()) {
        newSig.push([...leftSig, ...rightSig]);
      }
    }

    return newSig;
  }

  public ToBigMapKey(val: any) {
    return {
      key: this.EncodeObject(val),
      type: this.typeWithoutAnnotations(),
    };
  }

  public ToKey(val: any) {
    return this.Execute(val);
  }

  // public EncodeObject(args: any): any {
  //   const [leftToken, rightToken] = this.tokens();

  //   let leftValue;
  //   if (leftToken instanceof PairToken && !leftToken.hasAnnotations()) {
  //     leftValue = args;
  //   } else {
  //     leftValue = args[leftToken.annot()];
  //   }

  //   let rightValue;
  //   if (rightToken instanceof PairToken && !rightToken.hasAnnotations()) {
  //     rightValue = args;
  //   } else {
  //     rightValue = args[rightToken.annot()];
  //   }

  //   return {
  //     prim: 'Pair',
  //     args: [leftToken.EncodeObject(leftValue), rightToken.EncodeObject(rightValue)],
  //   };
  // }

  private traversal(getLeftValue: (token: Token) => any, getRightValue: (token: Token) => any) {
    const args = this.args();

    const leftToken = this.createToken(args[0], this.idx);
    let keyCount = 1;
    let leftValue;
    if (leftToken instanceof PairToken && !leftToken.hasAnnotations()) {
      leftValue = getLeftValue(leftToken);
      keyCount = Object.keys(leftToken.ExtractSchema()).length;
    } else {
      leftValue = { [leftToken.annot()]: getLeftValue(leftToken) };
    }

    const rightToken = this.createToken(args[1], this.idx + keyCount);
    let rightValue;
    if (rightToken instanceof PairToken && !rightToken.hasAnnotations()) {
      rightValue = getRightValue(rightToken);
    } else {
      rightValue = { [rightToken.annot()]: getRightValue(rightToken) };
    }

    const res = {
      ...leftValue,
      ...rightValue,
    };

    return res;
  }

  public Execute(val: any, semantics?: Semantic): { [key: string]: any } {
    const args = collapse(val, 'Pair');
    return this.traversal(
      (leftToken) => leftToken.Execute(args[0], semantics),
      (rightToken) => rightToken.Execute(args[1], semantics)
    );
  }

  /**
   * @deprecated ExtractSchema has been deprecated in favor of generateSchema
   *
   */
  public ExtractSchema(): any {
    return this.traversal(
      (leftToken) => leftToken.ExtractSchema(),
      (rightToken) => rightToken.ExtractSchema()
    );
  }

  generateSchema(): PairTokenSchema {
    return {
      __michelsonType: PairToken.prim,
      schema: this.traversal(
        (leftToken) => {
          if (leftToken instanceof PairToken && !leftToken.hasAnnotations()) {
            return leftToken.generateSchema().schema;
          } else {
            return leftToken.generateSchema();
          }
        },
        (rightToken) => {
          if (rightToken instanceof PairToken && !rightToken.hasAnnotations()) {
            return rightToken.generateSchema().schema;
          } else {
            return rightToken.generateSchema();
          }
        }
      ),
    };
  }

  public compare(val1: any, val2: any) {
    const [leftToken, rightToken] = this.tokens();

    const getValue = (token: Token, args: any) => {
      if (token instanceof PairToken && !token.hasAnnotations()) {
        return args;
      } else {
        return args[token.annot()];
      }
    };

    if (leftToken instanceof ComparableToken && rightToken instanceof ComparableToken) {
      const result: number = leftToken.compare(
        getValue(leftToken, val1),
        getValue(leftToken, val2)
      );

      if (result === 0) {
        return rightToken.compare(getValue(rightToken, val1), getValue(rightToken, val2));
      }

      return result;
    }

    throw new Error('Not a comparable pair');
  }

  findAndReturnTokens(tokenToFind: string, tokens: Token[]) {
    if (PairToken.prim === tokenToFind) {
      tokens.push(this);
    }
    this.tokens().map((t) => t.findAndReturnTokens(tokenToFind, tokens));
    return tokens;
  }
}

export class NatValidationError extends TokenValidationError {
  name = 'NatValidationError';
  constructor(public value: any, public token: NatToken, message: string) {
    super(value, token, message);
  }
}

export class NatToken extends ComparableToken {
  static prim: 'nat' = 'nat';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number,
    protected fac: TokenFactory
  ) {
    super(val, idx, fac);
  }

  public Execute(val: any): { [key: string]: any } {
    return new BigNumber(val[Object.keys(val)[0]]);
  }

  public Encode(args: any[]): any {
    const val = args.pop();

    const err = this.isValid(val);
    if (err) {
      throw err;
    }

    return { int: new BigNumber(val).toFixed() };
  }

  private isValid(val: any): NatValidationError | null {
    const bigNumber = new BigNumber(val);
    if (bigNumber.isNaN()) {
      return new NatValidationError(val, this, `Value is not a number: ${val}`);
    } else if (bigNumber.isNegative()) {
      return new NatValidationError(val, this, `Value cannot be negative: ${val}`);
    } else {
      return null;
    }
  }

  public EncodeObject(val: any): any {
    const err = this.isValid(val);
    if (err) {
      throw err;
    }

    return { int: new BigNumber(val).toFixed() };
  }

  /**
   * @deprecated ExtractSchema has been deprecated in favor of generateSchema
   *
   */
  public ExtractSchema() {
    return NatToken.prim;
  }

  generateSchema(): BaseTokenSchema {
    return {
      __michelsonType: NatToken.prim,
      schema: NatToken.prim,
    };
  }

  public ToBigMapKey(val: string | number) {
    return {
      key: { int: String(val) },
      type: { prim: NatToken.prim },
    };
  }

  public ToKey({ int }: any) {
    return new BigNumber(int);
  }

  compare(nat1: string | number, nat2: string | number) {
    const o1 = Number(nat1);
    const o2 = Number(nat2);
    if (o1 === o2) {
      return 0;
    }

    return o1 < o2 ? -1 : 1;
  }

  findAndReturnTokens(tokenToFind: string, tokens: Token[]) {
    if (NatToken.prim === tokenToFind) {
      tokens.push(this);
    }
    return tokens;
  }
}

export class StringToken extends ComparableToken {
  static prim: 'string' = 'string';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number,
    protected fac: TokenFactory
  ) {
    super(val, idx, fac);
  }

  public Execute(val: any): string {
    return val[Object.keys(val)[0]];
  }

  /**
   * @deprecated ExtractSchema has been deprecated in favor of generateSchema
   *
   */
  public ExtractSchema() {
    return StringToken.prim;
  }

  generateSchema(): BaseTokenSchema {
    return {
      __michelsonType: StringToken.prim,
      schema: StringToken.prim,
    };
  }

  public Encode(args: any[]): any {
    const val = args.pop();
    return { string: val };
  }

  public EncodeObject(val: any): any {
    return { string: val };
  }

  public ToKey({ string }: any) {
    return string;
  }

  public ToBigMapKey(val: string) {
    return {
      key: { string: val },
      type: { prim: StringToken.prim },
    };
  }

  findAndReturnTokens(tokenToFind: string, tokens: Token[]) {
    if (StringToken.prim === tokenToFind) {
      tokens.push(this);
    }
    return tokens;
  }
}
// export class Buffer {
//   length: number;
//   write(string: string, offset?: number, length?: number, encoding?: string): number;
//   toString(encoding?: string, start?: number, end?: number): string;
//   toJSON(): { type: 'Buffer', data: any[] };
//   equals(otherBuffer: Buffer): boolean;
//   compare(otherBuffer: Uint8Array, targetStart?: number, targetEnd?: number, sourceStart?: number, sourceEnd?: number): number;
//   copy(targetBuffer: Buffer, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;
//   slice(start?: number, end?: number): Buffer;
//   writeUIntLE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
//   writeUIntBE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
//   writeIntLE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
//   writeIntBE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
//   readUIntLE(offset: number, byteLength: number, noAssert?: boolean): number;
//   readUIntBE(offset: number, byteLength: number, noAssert?: boolean): number;
//   readIntLE(offset: number, byteLength: number, noAssert?: boolean): number;
//   readIntBE(offset: number, byteLength: number, noAssert?: boolean): number;
//   readUInt8(offset: number, noAssert?: boolean): number;
//   readUInt16LE(offset: number, noAssert?: boolean): number;
//   readUInt16BE(offset: number, noAssert?: boolean): number;
//   readUInt32LE(offset: number, noAssert?: boolean): number;
//   readUInt32BE(offset: number, noAssert?: boolean): number;
//   readBigUInt64LE(offset: number): BigInt;
//   readBigUInt64BE(offset: number): BigInt;
//   readInt8(offset: number, noAssert?: boolean): number;
//   readInt16LE(offset: number, noAssert?: boolean): number;
//   readInt16BE(offset: number, noAssert?: boolean): number;
//   readInt32LE(offset: number, noAssert?: boolean): number;
//   readInt32BE(offset: number, noAssert?: boolean): number;
//   readBigInt64LE(offset: number): BigInt;
//   readBigInt64BE(offset: number): BigInt;
//   readFloatLE(offset: number, noAssert?: boolean): number;
//   readFloatBE(offset: number, noAssert?: boolean): number;
//   readDoubleLE(offset: number, noAssert?: boolean): number;
//   readDoubleBE(offset: number, noAssert?: boolean): number;
//   reverse(): this;
//   swap16(): Buffer;
//   swap32(): Buffer;
//   swap64(): Buffer;
//   writeUInt8(value: number, offset: number, noAssert?: boolean): number;
//   writeUInt16LE(value: number, offset: number, noAssert?: boolean): number;
//   writeUInt16BE(value: number, offset: number, noAssert?: boolean): number;
//   writeUInt32LE(value: number, offset: number, noAssert?: boolean): number;
//   writeUInt32BE(value: number, offset: number, noAssert?: boolean): number;
//   writeBigUInt64LE(value: number, offset: number): BigInt;
//   writeBigUInt64BE(value: number, offset: number): BigInt;
//   writeInt8(value: number, offset: number, noAssert?: boolean): number;
//   writeInt16LE(value: number, offset: number, noAssert?: boolean): number;
//   writeInt16BE(value: number, offset: number, noAssert?: boolean): number;
//   writeInt32LE(value: number, offset: number, noAssert?: boolean): number;
//   writeInt32BE(value: number, offset: number, noAssert?: boolean): number;
//   writeBigInt64LE(value: number, offset: number): BigInt;
//   writeBigInt64BE(value: number, offset: number): BigInt;
//   writeFloatLE(value: number, offset: number, noAssert?: boolean): number;
//   writeFloatBE(value: number, offset: number, noAssert?: boolean): number;
//   writeDoubleLE(value: number, offset: number, noAssert?: boolean): number;
//   writeDoubleBE(value: number, offset: number, noAssert?: boolean): number;
//   fill(value: any, offset?: number, end?: number): this;
//   indexOf(value: string | number | Buffer, byteOffset?: number, encoding?: string): number;
//   lastIndexOf(value: string | number | Buffer, byteOffset?: number, encoding?: string): number;
//   includes(value: string | number | Buffer, byteOffset?: number, encoding?: string): boolean;
//   constructor (str: string, encoding?: string);
//   constructor (size: number);
//   constructor (array: Uint8Array);
//   constructor (arrayBuffer: ArrayBuffer);
//   constructor (array: any[]);
//   constructor (buffer: Buffer);
//   prototype: Buffer;
//   static from(array: any[]): Buffer;
//   static from(arrayBuffer: ArrayBuffer, byteOffset?: number, length?: number): Buffer;
//   static from(buffer: Buffer | Uint8Array): Buffer;
//   static from(str: string, encoding?: string): Buffer;
//   static isBuffer(obj: any): obj is Buffer;
//   static isEncoding(encoding: string): boolean;
//   static byteLength(string: string, encoding?: string): number;
//   static concat(list: Uint8Array[], totalLength?: number): Buffer;
//   static compare(buf1: Uint8Array, buf2: Uint8Array): number;
//   static alloc(size: number, fill?: string | Buffer | number, encoding?: string): Buffer;
//   static allocUnsafe(size: number): Buffer;
//   static allocUnsafeSlow(size: number): Buffer;
// }
// export const buf2hex = (buffer: Buffer): string => {
//   const byteArray = new Uint8Array(buffer);
//   const hexParts: string[] = [];
//   byteArray.forEach((byte: any) => {
//     const hex = byte.toString(16);
//     const paddedHex = `00${hex}`.slice(-2);
//     hexParts.push(paddedHex);
//   });
//   return hexParts.join('');
// };
// export function b58decode(payload: string) {
//   // const buf: Buffer = Bs58check.decode(payload);

//   const prefixMap = {
//     [prefix.tz1.toString()]: '0000',
//     [prefix.tz2.toString()]: '0001',
//     [prefix.tz3.toString()]: '0002',
//   };

//   const pref = prefixMap[new Uint8Array(buf.slice(0, 3)).toString()];
//   if (pref) {
//     // tz addresses
//     const hex = buf2hex(buf.slice(3));
//     return pref + hex;
//   } else {
//     // other (kt addresses)
//     return '01' + buf2hex(buf.slice(3, 42)) + '00';
//   }
// }
export class AddressValidationError extends TokenValidationError {
  name = 'AddressValidationError';
  constructor(public value: any, public token: AddressToken, message: string) {
    super(value, token, message);
  }
}
const implicitPrefix = [Prefix.TZ1, Prefix.TZ2, Prefix.TZ3];
const contractPrefix = [Prefix.KT1];
export function validateAddress(value: any): ValidationResult {
  return validatePrefixedValue(value, [...implicitPrefix, ...contractPrefix]);
}
export function encodePubKey(value: string) {
  if (value.substring(0, 2) === '00') {
    const pref: { [key: string]: Uint8Array } = {
      '0000': prefix.tz1,
      '0001': prefix.tz2,
      '0002': prefix.tz3,
    };

    return b58cencode(value.substring(4), pref[value.substring(0, 4)]);
  }

  return b58cencode(value.substring(2, 42), prefix.KT);
}

export class AddressToken extends ComparableToken {
  static prim: 'address' = 'address';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number,
    protected fac: TokenFactory
  ) {
    super(val, idx, fac);
  }

  // public ToBigMapKey(val: any) {
  //   const decoded = b58decode(val);
  //   return {
  //     key: { bytes: decoded },
  //     type: { prim: 'bytes' },
  //   };
  // }

  private isValid(value: any): AddressValidationError | null {
    if (validateAddress(value) !== ValidationResult.VALID) {
      return new AddressValidationError(value, this, `Address is not valid: ${value}`);
    }

    return null;
  }

  public Encode(args: any[]): any {
    const val = args.pop();

    const err = this.isValid(val);
    if (err) {
      throw err;
    }

    return { string: val };
  }

  public EncodeObject(val: any): any {
    const err = this.isValid(val);
    if (err) {
      throw err;
    }

    return { string: val };
  }

  public Execute(val: { bytes: string; string: string }): string {
    if (val.string) {
      return val.string;
    }

    return encodePubKey(val.bytes);
  }

  /**
   * @deprecated ExtractSchema has been deprecated in favor of generateSchema
   *
   */
  public ExtractSchema() {
    return AddressToken.prim;
  }

  generateSchema(): BaseTokenSchema {
    return {
      __michelsonType: AddressToken.prim,
      schema: AddressToken.prim,
    };
  }

  public ToKey({ bytes, string }: any) {
    if (string) {
      return string;
    }

    return encodePubKey(bytes);
  }

  compare(address1: string, address2: string) {
    const isImplicit = (address: string) => {
      return address.startsWith('tz');
    };

    if (isImplicit(address1) && isImplicit(address2)) {
      return super.compare(address1, address2);
    } else if (isImplicit(address1)) {
      return -1;
    } else if (isImplicit(address2)) {
      return 1;
    } else {
      return super.compare(address1, address2);
    }
  }

  findAndReturnTokens(tokenToFind: string, tokens: Token[]) {
    if (AddressToken.prim === tokenToFind) {
      tokens.push(this);
    }
    return tokens;
  }
}
export class MapValidationError extends TokenValidationError {
  name = 'MapValidationError';
  constructor(public value: any, public token: MapToken, message: string) {
    super(value, token, message);
  }
}

export class MapToken extends Token {
  static prim: 'map' = 'map';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number,
    protected fac: TokenFactory
  ) {
    super(val, idx, fac);
  }

  get ValueSchema() {
    return this.createToken(this.val.args[1], 0);
  }

  get KeySchema(): ComparableToken {
    return this.createToken(this.val.args[0], 0) as any;
  }

  private isValid(value: any): MapValidationError | null {
    if (MichelsonMap.isMichelsonMap(value)) {
      return null;
    }

    return new MapValidationError(value, this, 'Value must be a MichelsonMap');
  }

  public Execute(val: any[], semantics?: Semantic): { [key: string]: any } {
    const map = new MichelsonMap(this.val);

    val.forEach((current) => {
      map.set(
        this.KeySchema.ToKey(current.args[0]),
        this.ValueSchema.Execute(current.args[1], semantics)
      );
    });
    return map;
  }

  // public Encode(args: any[]): any {
  //   const val: MichelsonMap<any, any> = args.pop();

  //   const err = this.isValid(val);
  //   if (err) {
  //     throw err;
  //   }

  //   return Array.from(val.keys())
  //     .sort((a: any, b: any) => this.KeySchema.compare(a, b))
  //     .map((key) => {
  //       return {
  //         prim: 'Elt',
  //         args: [this.KeySchema.EncodeObject(key), this.ValueSchema.EncodeObject(val.get(key))],
  //       };
  //     });
  // }

  // public EncodeObject(args: any): any {
  //   const val: MichelsonMap<any, any> = args;

  //   const err = this.isValid(val);
  //   if (err) {
  //     throw err;
  //   }

  //   return Array.from(val.keys())
  //     .sort((a: any, b: any) => this.KeySchema.compare(a, b))
  //     .map((key) => {
  //       return {
  //         prim: 'Elt',
  //         args: [this.KeySchema.EncodeObject(key), this.ValueSchema.EncodeObject(val.get(key))],
  //       };
  //     });
  // }

  /**
   * @deprecated ExtractSchema has been deprecated in favor of generateSchema
   *
   */
  public ExtractSchema() {
    return {
      map: {
        key: this.KeySchema.ExtractSchema(),
        value: this.ValueSchema.ExtractSchema(),
      },
    };
  }

  generateSchema(): MapTokenSchema {
    return {
      __michelsonType: MapToken.prim,
      schema: {
        key: this.KeySchema.generateSchema(),
        value: this.ValueSchema.generateSchema(),
      },
    };
  }

  findAndReturnTokens(tokenToFind: string, tokens: Token[]) {
    if (MapToken.prim === tokenToFind) {
      tokens.push(this);
    }
    this.KeySchema.findAndReturnTokens(tokenToFind, tokens);
    this.ValueSchema.findAndReturnTokens(tokenToFind, tokens);
    return tokens;
  }
}

export class BoolToken extends ComparableToken {
  static prim: 'bool' = 'bool';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number,
    protected fac: TokenFactory
  ) {
    super(val, idx, fac);
  }

  public Execute(val: any): boolean {
    return String(val.prim).toLowerCase() === 'true' ? true : false;
  }

  public Encode(args: any[]): any {
    const val = args.pop();
    return { prim: val ? 'True' : 'False' };
  }

  public EncodeObject(val: any) {
    return { prim: val ? 'True' : 'False' };
  }

  /**
   * @deprecated ExtractSchema has been deprecated in favor of generateSchema
   *
   */
  public ExtractSchema() {
    return BoolToken.prim;
  }

  generateSchema(): BaseTokenSchema {
    return {
      __michelsonType: BoolToken.prim,
      schema: BoolToken.prim,
    };
  }

  ToBigMapKey(val: string): { key: { [key: string]: string }; type: { prim: string } } {
    return {
      key: this.EncodeObject(val),
      type: { prim: BoolToken.prim },
    };
  }

  ToKey(val: string) {
    return this.EncodeObject(val);
  }

  compare(val1: any, val2: any) {
    if ((val1 && val2) || (!val1 && !val2)) {
      return 0;
    } else if (val1) {
      return 1;
    } else {
      return -1;
    }
  }

  findAndReturnTokens(tokenToFind: string, tokens: Token[]) {
    if (BoolToken.prim === tokenToFind) {
      tokens.push(this);
    }
    return tokens;
  }
}
export class ContractValidationError extends TokenValidationError {
  name = 'ContractValidationError';
  constructor(public value: any, public token: ContractToken, message: string) {
    super(value, token, message);
  }
}

export class ContractToken extends Token {
  static prim: 'contract' = 'contract';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number,
    protected fac: TokenFactory
  ) {
    super(val, idx, fac);
  }

  private isValid(value: any): ContractValidationError | null {
    // tz1,tz2 and tz3 seems to be valid contract values (for Unit contract)
    if (validateAddress(value) !== ValidationResult.VALID) {
      return new ContractValidationError(value, this, 'Contract address is not valid');
    }

    return null;
  }

  public Execute(val: { bytes: string; string: string }) {
    if (val.string) {
      return val.string;
    }

    return encodePubKey(val.bytes);
  }

  public Encode(args: any[]): any {
    const val = args.pop();
    const err = this.isValid(val);
    if (err) {
      throw err;
    }
    return { string: val };
  }

  public EncodeObject(val: any): any {
    const err = this.isValid(val);
    if (err) {
      throw err;
    }
    return { string: val };
  }

  /**
   * @deprecated ExtractSchema has been deprecated in favor of generateSchema
   *
   */
  public ExtractSchema() {
    return ContractToken.prim;
  }

  generateSchema(): ContractTokenSchema {
    const valueSchema = this.createToken(this.val.args[0], 0);
    return {
      __michelsonType: ContractToken.prim,
      schema: {
        parameter: valueSchema.generateSchema(),
      },
    };
  }

  findAndReturnTokens(tokenToFind: string, tokens: Token[]) {
    if (ContractToken.prim === tokenToFind) {
      tokens.push(this);
    }
    return tokens;
  }
}
export class ListValidationError extends TokenValidationError {
  name = 'ListValidationError';
  constructor(public value: any, public token: ListToken, message: string) {
    super(value, token, message);
  }
}
export class ListToken extends Token {
  static prim: 'list' = 'list';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number,
    protected fac: TokenFactory
  ) {
    super(val, idx, fac);
  }

  get valueSchema() {
    return this.createToken(this.val.args[0], this.idx);
  }

  private isValid(value: any): ListValidationError | null {
    if (Array.isArray(value)) {
      return null;
    }

    return new ListValidationError(value, this, 'Value must be an array');
  }

  // public Encode(args: any[]): any {
  //   const val = args.pop();

  //   const err = this.isValid(val);
  //   if (err) {
  //     throw err;
  //   }

  //   const schema = this.createToken(this.val.args[0], 0);
  //   return val.reduce((prev: any, current: any) => {
  //     return [...prev, schema.EncodeObject(current)];
  //   }, []);
  // }

  public Execute(val: any, semantics?: Semantic) {
    const schema = this.createToken(this.val.args[0], 0);

    const err = this.isValid(val);
    if (err) {
      throw err;
    }

    return val.reduce((prev: any, current: any) => {
      return [...prev, schema.Execute(current, semantics)];
    }, []);
  }

  public EncodeObject(args: any): any {
    const schema = this.createToken(this.val.args[0], 0);

    const err = this.isValid(args);
    if (err) {
      throw err;
    }

    return args.reduce((prev: any, current: any) => {
      return [...prev, schema.EncodeObject(current)];
    }, []);
  }

  /**
   * @deprecated ExtractSchema has been deprecated in favor of generateSchema
   *
   */
  public ExtractSchema() {
    return {
      [ListToken.prim]: this.valueSchema.ExtractSchema(),
    };
  }

  generateSchema(): ListTokenSchema {
    return {
      __michelsonType: ListToken.prim,
      schema: this.valueSchema.generateSchema(),
    };
  }

  findAndReturnTokens(tokenToFind: string, tokens: Token[]) {
    if (ListToken.prim === tokenToFind) {
      tokens.push(this);
    }
    this.createToken(this.val.args[0], this.idx).findAndReturnTokens(tokenToFind, tokens);
    return tokens;
  }
}
export class MutezValidationError extends TokenValidationError {
  name = 'MutezValidationError';
  constructor(public value: any, public token: MutezToken, message: string) {
    super(value, token, message);
  }
}

export class MutezToken extends ComparableToken {
  static prim: 'mutez' = 'mutez';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number,
    protected fac: TokenFactory
  ) {
    super(val, idx, fac);
  }

  public Execute(val: any) {
    return new BigNumber(val[Object.keys(val)[0]]);
  }

  /**
   * @deprecated ExtractSchema has been deprecated in favor of generateSchema
   *
   */
  public ExtractSchema() {
    return MutezToken.prim;
  }

  generateSchema(): BaseTokenSchema {
    return {
      __michelsonType: MutezToken.prim,
      schema: MutezToken.prim,
    };
  }

  private isValid(val: any): MutezValidationError | null {
    const bigNumber = new BigNumber(val);
    if (bigNumber.isNaN()) {
      return new MutezValidationError(val, this, `Value is not a number: ${val}`);
    } else {
      return null;
    }
  }

  public Encode(args: any[]): any {
    const val = args.pop();

    const err = this.isValid(val);
    if (err) {
      throw err;
    }

    return { int: String(val).toString() };
  }

  public EncodeObject(val: any): any {
    const err = this.isValid(val);
    if (err) {
      throw err;
    }

    return { int: String(val).toString() };
  }

  public ToBigMapKey(val: string | number) {
    return {
      key: { int: String(val) },
      type: { prim: MutezToken.prim },
    };
  }

  public ToKey({ int }: any) {
    return int;
  }

  compare(mutez1: string | number, mutez2: string | number) {
    const o1 = Number(mutez1);
    const o2 = Number(mutez2);
    if (o1 === o2) {
      return 0;
    }

    return o1 < o2 ? -1 : 1;
  }

  findAndReturnTokens(tokenToFind: string, tokens: Token[]) {
    if (MutezToken.prim === tokenToFind) {
      tokens.push(this);
    }
    return tokens;
  }
}
export class BytesValidationError extends TokenValidationError {
  name = 'BytesValidationError';
  constructor(public value: any, public token: BytesToken, message: string) {
    super(value, token, message);
  }
}

export class BytesToken extends Token {
  static prim: 'bytes' = 'bytes';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number,
    protected fac: TokenFactory
  ) {
    super(val, idx, fac);
  }

  public ToBigMapKey(val: string) {
    return {
      key: { bytes: val },
      type: { prim: BytesToken.prim },
    };
  }

  private isValid(val: any): BytesValidationError | null {
    if (typeof val === 'string' && /^[0-9a-fA-F]*$/.test(val) && val.length % 2 === 0) {
      return null;
    } else {
      return new BytesValidationError(val, this, `Invalid bytes: ${val}`);
    }
  }

  // private convertUint8ArrayToHexString(val: any) {
  //   return val.constructor === Uint8Array ? Buffer.from(val).toString('hex') : val;
  // }

  // public Encode(args: any[]): any {
  //   let val = args.pop();

  //   val = this.convertUint8ArrayToHexString(val);
  //   const err = this.isValid(val);
  //   if (err) {
  //     throw err;
  //   }

  //   return { bytes: String(val).toString() };
  // }

  // public EncodeObject(val: string | Uint8Array) {
  //   val = this.convertUint8ArrayToHexString(val);
  //   const err = this.isValid(val);
  //   if (err) {
  //     throw err;
  //   }

  //   return { bytes: String(val).toString() };
  // }

  public Execute(val: any): string {
    return val.bytes;
  }

  /**
   * @deprecated ExtractSchema has been deprecated in favor of generateSchema
   *
   */
  public ExtractSchema() {
    return BytesToken.prim;
  }

  generateSchema(): BaseTokenSchema {
    return {
      __michelsonType: BytesToken.prim,
      schema: BytesToken.prim,
    };
  }

  public ToKey({ bytes, string }: any) {
    if (string) {
      return string;
    }

    return bytes;
  }

  findAndReturnTokens(tokenToFind: string, tokens: Token[]) {
    if (BytesToken.prim === tokenToFind) {
      tokens.push(this);
    }
    return tokens;
  }
}
export class OptionToken extends ComparableToken {
  static prim: 'option' = 'option';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number,
    protected fac: TokenFactory
  ) {
    super(val, idx, fac);
  }

  public subToken(): Token {
    return this.createToken(this.val.args[0], this.idx);
  }

  schema(): Token {
    return this.createToken(this.val.args[0], 0);
  }

  annot(): string {
    return Array.isArray(this.val.annots)
      ? super.annot()
      : this.createToken(this.val.args[0], this.idx).annot();
  }

  // public Encode(args: any): any {
  //   const value = args;
  //   if (value === undefined || value === null) {
  //     return { prim: 'None' };
  //   } else if (
  //     Array.isArray(value) &&
  //     (value[value.length - 1] === undefined || value[value.length - 1] === null)
  //   ) {
  //     value.pop();
  //     return { prim: 'None' };
  //   }

  //   return { prim: 'Some', args: [this.schema().Encode(args)] };
  // }

  public EncodeObject(args: any): any {
    const value = args;

    if (value === undefined || value === null) {
      return { prim: 'None' };
    }

    return { prim: 'Some', args: [this.schema().EncodeObject(value)] };
  }

  public Execute(val: any, semantics?: Semantic) {
    if (val.prim === 'None') {
      return null;
    }

    return this.schema().Execute(val.args[0], semantics);
  }

  /**
   * @deprecated ExtractSchema has been deprecated in favor of generateSchema
   *
   */
  public ExtractSchema() {
    return this.schema().ExtractSchema();
  }

  generateSchema(): OptionTokenSchema {
    return {
      __michelsonType: OptionToken.prim,
      schema: this.schema().generateSchema(),
    };
  }

  public ExtractSignature() {
    return [...this.schema().ExtractSignature(), []];
  }

  get KeySchema(): ComparableToken {
    return this.schema() as any;
  }

  compare(val1: any, val2: any) {
    if (!val1) {
      return -1;
    } else if (!val2) {
      return 1;
    }
    return this.KeySchema.compare(val1, val2);
  }

  public ToKey(val: any) {
    return this.Execute(val);
  }

  public ToBigMapKey(val: any) {
    return {
      key: this.EncodeObject(val),
      type: this.typeWithoutAnnotations(),
    };
  }

  findAndReturnTokens(tokenToFind: string, tokens: Token[]) {
    if (OptionToken.prim === tokenToFind) {
      tokens.push(this);
    }
    this.subToken().findAndReturnTokens(tokenToFind, tokens);
    return tokens;
  }
}
export class TimestampToken extends ComparableToken {
  static prim: 'timestamp' = 'timestamp';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number,
    protected fac: TokenFactory
  ) {
    super(val, idx, fac);
  }

  public Execute(val: { string?: string; int?: string }) {
    if (val.string && /^\d+$/.test(val.string)) {
      return new Date(Number(val.string) * 1000).toISOString();
    } else if (val.string) {
      return new Date(val.string).toISOString();
    } else if (val.int) {
      return new Date(Number(val.int) * 1000).toISOString();
    }
  }

  public Encode(args: any[]): any {
    const val = args.pop();
    return { string: val };
  }

  public EncodeObject(val: any): any {
    return { string: val };
  }

  /**
   * @deprecated ExtractSchema has been deprecated in favor of generateSchema
   *
   */
  public ExtractSchema() {
    return TimestampToken.prim;
  }

  generateSchema(): BaseTokenSchema {
    return {
      __michelsonType: TimestampToken.prim,
      schema: TimestampToken.prim,
    };
  }

  public ToKey({ string }: any) {
    return string;
  }

  public ToBigMapKey(val: string) {
    return {
      key: { string: val },
      type: { prim: TimestampToken.prim },
    };
  }

  findAndReturnTokens(tokenToFind: string, tokens: Token[]) {
    if (TimestampToken.prim === tokenToFind) {
      tokens.push(this);
    }
    return tokens;
  }
}

export const tokens = [
  PairToken,
  NatToken,
  StringToken,
  BigMapToken,
  AddressToken,
  MapToken,
  BoolToken,
  OrToken,
  ContractToken,
  ListToken,
  MutezToken,
  BytesToken,
  OptionToken,
  TimestampToken,
  // IntToken,
  // UnitToken,
  // KeyToken,
  // KeyHashToken,
  // SignatureToken,
  // LambdaToken,
  // OperationToken,
  // SetToken,
  // ChainIDToken,
  // TicketToken,
  // NeverToken,
  // SaplingStateToken,
  // SaplingTransactionToken,
  // Bls12381frToken,
  // Bls12381g1Token,
  // Bls12381g2Token,
  // ChestToken,
  // ChestKeyToken,
  // GlobalConstantToken
];

export class InvalidTokenError extends Error {
  name = 'Invalid token error';
  constructor(public message: string, public data: any) {
    super(message);
  }
}
export function createToken(val: any, idx: number): Token {
  if (Array.isArray(val)) {
    return new PairToken(val, idx, createToken);
  }

  const t = tokens.find((x) => x.prim === val.prim);
  if (!t) {
    throw new InvalidTokenError('Malformed data expected a value with a valid prim property', val);
  }
  return new t(val, idx, createToken);
}

export type ContractSchema = Schema | unknown;

export interface StorageProvider {
  getStorage<T>(contract: string, schema?: ContractSchema): Promise<T>;
  getBigMapKey<T>(contract: string, key: string, schema?: ContractSchema): Promise<T>;
  getBigMapKeyByID<T>(id: string, keyToEncode: BigMapKeyType, schema: Schema, block?: number): Promise<T>;
  getBigMapKeysByID<T>(id: string, keysToEncode: Array<BigMapKeyType>, schema: Schema, block?: number, batchSize?: number): Promise<MichelsonMap<MichelsonMapKey, T | undefined>>;
  getSaplingDiffByID(id: string, block?: number): Promise<SaplingDiffResponse>;
}
interface PollingConfig {
  timeout: number;
  interval: number;
}
export declare function mapTo<T, R>(value: R): OperatorFunction<T, R>;
export interface OperatorFunction<T, R> extends UnaryFunction<Observable<T>, Observable<R>> {};
export interface UnaryFunction<T, R> {
    (source: T): R;
}
export interface ForgedBytes {
  opbytes: string;
  opOb: OperationObject;
  counter: number;
}
export declare function switchMapTo<R>(observable: ObservableInput<R>): OperatorFunction<any, R>;
export declare const EMPTY: Observable<never>;
export class Operation {
  private _pollingConfig$ = new ReplaySubject<PollingConfig>(1);

  private _currentHeadPromise: Promise<BlockResponse> | undefined = undefined;

  // Caching the current head for one second
  private currentHead$ = defer(() => {
    if (!this._currentHeadPromise) {
      this._currentHeadPromise = this.context.rpc.getBlock();
      timer(1000)
        .pipe(first())
        .subscribe(() => {
          this._currentHeadPromise = undefined;
        });
    }
    return from(this._currentHeadPromise);
  });

  // Polling observable that emit until timeout is reached
  private polling$ = defer(() =>
    this._pollingConfig$.pipe(
      tap(({ timeout, interval }) => {
        if (timeout <= 0) {
          throw new Error('Timeout must be more than 0');
        }

        if (interval <= 0) {
          throw new Error('Interval must be more than 0');
        }
      }),
      map((config) => ({
        ...config,
        timeoutAt: Math.ceil(config.timeout / config.interval) + 1,
        count: 0,
      })),
      switchMap((config) => timer(0, config.interval * 1000).pipe(mapTo(config))),
      tap((config) => {
        config.count++;
        if (config.count > config.timeoutAt) {
          throw new Error(`Confirmation polling timed out`);
        }
      })
    )
  );

  // Observable that emit once operation is seen in a block
  private confirmed$ = this.polling$.pipe(
    switchMapTo(this.currentHead$),
    map((head) => {
      for (let i = 3; i >= 0; i--) {
        head.operations[i].forEach((op) => {
          if (op.hash === this.hash) {
            this._foundAt = head.header.level;
          }
        });
      }

      if (head.header.level - this._foundAt >= 0) {
        return this._foundAt;
      }
    }),
    filter((x) => x !== undefined),
    first(),
    shareReplay()
  );

  protected _foundAt = Number.POSITIVE_INFINITY;
  get includedInBlock() {
    return this._foundAt;
  }
  /**
   *
   * @param hash Operation hash
   * @param raw Raw operation that was injected
   * @param context Taquito context allowing access to rpc and signer
   */
  constructor(
    public readonly hash: string,
    public readonly raw: ForgedBytes,
    public readonly results: OperationContentsAndResult[],
    protected readonly context: Context
  ) {
    if (validateOperation(this.hash) !== ValidationResult.VALID) {
      throw new InvalidOperationHashError(`Invalid Operation Hash: ${this.hash}`);
    }

    this.confirmed$.pipe(first(),
      catchError(() => {
        return of(EMPTY)
      })
    ).subscribe();
  }

  get revealOperation() {
    return (
      Array.isArray(this.results) &&
      (this.results.find((op) => op.kind === 'reveal') as
        | OperationContentsAndResultReveal
        | undefined)
    );
  }

  public get revealStatus() {
    if (this.revealOperation) {
      return this.revealOperation.metadata.operation_result.status;
    } else {
      return 'unknown';
    }
  }

  public get status() {
    return (
      this.results.map((result) => {
        if (hasMetadataWithResult(result)) {
          return result.metadata.operation_result.status;
        } else {
          return 'unknown';
        }
      })[0] || 'unknown'
    );
  }

  /**
   *
   * @param confirmations [0] Number of confirmation to wait for
   * @param interval [10] Polling interval
   * @param timeout [180] Timeout
   */
  async confirmation(confirmations?: number, interval?: number, timeout?: number) {
    if (typeof confirmations !== 'undefined' && confirmations < 1) {
      throw new Error('Confirmation count must be at least 1');
    }

    const confirmationPollingIntervalSecond =
      this.context.config.confirmationPollingIntervalSecond !== undefined
        ? this.context.config.confirmationPollingIntervalSecond
        : await this.context.getConfirmationPollingInterval();

    const { defaultConfirmationCount, confirmationPollingTimeoutSecond } = this.context.config;
    this._pollingConfig$.next({
      interval: interval || confirmationPollingIntervalSecond,
      timeout: timeout || confirmationPollingTimeoutSecond,
    } as Required<PollingConfig>);

    const conf = confirmations !== undefined ? confirmations : defaultConfirmationCount;

    return new Promise<number>((resolve, reject) => {
      this.confirmed$
        .pipe(
          switchMap(() => this.polling$),
          switchMap(() => this.currentHead$),
          filter((head) => head.header.level - this._foundAt >= conf - 1),
          first()
        )
        .subscribe((_) => {
          resolve(this._foundAt + (conf - 1));
        }, reject);
    });
  }
}
export interface GasConsumingOperation {
  consumedGas?: string;
  gasLimit: number;
}
export interface StorageConsumingOperation {
  storageDiff?: string;
  storageSize?: string;
  storageLimit: number;
}
export interface FeeConsumingOperation {
  fee: number;
}
export interface RPCOriginationOperation {
  kind: OpKind.ORIGINATION;
  fee: number;
  gas_limit: number;
  storage_limit: number;
  balance: string;
  delegate?: string;
  source?: string;
  script: {
    code: any;
    storage: any;
  };
}
export type withKind<T, K extends OpKind> = T & { kind: K };
export interface ActivationParams {
  pkh: string;
  secret: string;
}
export interface TransferParams {
  to: string;
  source?: string;
  amount: number;
  fee?: number;
  parameter?: TransactionOperationParameter;
  gasLimit?: number;
  storageLimit?: number;
  mutez?: boolean;
}
export interface RegisterGlobalConstantParams {
  value: MichelsonV1Expression;
  source?: string;
  fee?: number;
  gasLimit?: number;
  storageLimit?: number;
}
export interface RPCTransferOperation {
  kind: OpKind.TRANSACTION;
  fee: number;
  gas_limit: number;
  storage_limit: number;
  amount: string;
  source?: string;
  destination: string;
  parameters?: TransactionOperationParameter;
}
export interface RPCDelegateOperation {
  kind: OpKind.DELEGATION;
  source?: string;
  fee: number;
  gas_limit: number;
  storage_limit: number;
  delegate?: string;
}
export interface RPCRevealOperation {
  kind: OpKind.REVEAL;
  fee: number;
  public_key: string;
  source?: string;
  gas_limit: number;
  storage_limit: number;
}
export interface RPCActivateOperation {
  kind: OpKind.ACTIVATION;
  pkh: string;
  secret: string;
}
export interface RPCRegisterGlobalConstantOperation {
 kind: OpKind.REGISTER_GLOBAL_CONSTANT;
 fee: number;
 gas_limit: number;
 storage_limit: number;
 source: string;
 value: MichelsonV1Expression;
}
export enum Protocols {
  Pt24m4xi = 'Pt24m4xiPbLDhVgVfABUjirbmda3yohdN82Sp9FeuAXJ4eV9otd',
  PsBABY5H = 'PsBABY5HQTSkA4297zNHfsZNKtxULfL18y95qb3m53QJiXGmrbU',
  PsBabyM1 = 'PsBabyM1eUXZseaJdmXFApDSBqj8YBfwELoxZHHW77EMcAbbwAS',
  PsCARTHA = 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
  PsDELPH1 = 'PsDELPH1Kxsxt8f9eWbxQeRxkjfbxoqM52jvs5Y5fBxWWh4ifpo',
  PtEdo2Zk = 'PtEdo2ZkT9oKpimTah6x2embF25oss54njMuPzkJTEi5RqfdZFA',
  PsFLorena = 'PsFLorenaUUuikDWvMDr6fGBRG8kt3e3D3fHoXK1j1BFRxeSH4i',
  PtGRANADs = 'PtGRANADsDU8R9daYKAgWnQYAJ64omN1o3KMGVCykShA97vQbvV',
  PtHangz2 = 'PtHangz2aRngywmSRGGvrcTyMbbdpWdpFKuS4uMWxg2RaH9i1qx',
  PsiThaCa = 'PsiThaCaT47Zboaw71QWScM8sXeMM7bbQFncK9FLqYc6EKdpjVP',
  Psithaca2 = 'Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A',
  ProtoALpha = 'ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK', // temporary protocol hash
}
export type ParamsWithKind =
  | withKind<OriginateParams, OpKind.ORIGINATION>
  | withKind<DelegateParams, OpKind.DELEGATION>
  | withKind<TransferParams, OpKind.TRANSACTION>
  | withKind<ActivationParams, OpKind.ACTIVATION>
  | withKind<RegisterGlobalConstantParams, OpKind.REGISTER_GLOBAL_CONSTANT>;
export type RPCOperation =
  | RPCOriginationOperation
  | RPCTransferOperation
  | RPCDelegateOperation
  | RPCRevealOperation
  | RPCActivateOperation
  | RPCRegisterGlobalConstantOperation;
export const isOpRequireReveal = <T extends { kind: OpKind }>(
  op: T
): op is withKind<T, Exclude<InternalOperationResultKindEnum, OpKind.REVEAL>> => {
  return ['transaction', 'delegation', 'origination', 'register_global_constant'].indexOf(op.kind) !== -1;
};
export interface PreparedOperation {
  opOb: {
    branch: string;
    contents: OperationContents[];
    protocol: string;
  };
  counter: number;
}
export type PrepareOperationParams = {
  operation: RPCOperation | RPCOperation[];
  source?: string;
};
const MINIMAL_FEE_MUTEZ = 100;
const GAS_BUFFER = 100;
const MINIMAL_FEE_PER_GAS_MUTEZ = 0.1;
const MINIMAL_FEE_PER_BYTE_MUTEZ = 1;
export interface EstimateProperties {
  milligasLimit: number,
  storageLimit: number,
  opSize: number,
  minimalFeePerStorageByteMutez: number,
  baseFeeMutez?: number
}
export class Estimate {
  constructor(
    private readonly _milligasLimit: number | string,
    private readonly _storageLimit: number | string,
    public readonly opSize: number | string,
    private readonly minimalFeePerStorageByteMutez: number | string,
    /**
     * @description Base fee in mutez (1 mutez = 1e10−6 tez)
     */
    private readonly baseFeeMutez: number | string = MINIMAL_FEE_MUTEZ
  ) {}

  /**
   * @description The number of Mutez that will be burned for the storage of the [operation](https://tezos.gitlab.io/user/glossary.html#operations). (Storage + Allocation fees)
   */
  get burnFeeMutez() {
    return this.roundUp(Number(this.storageLimit) * Number(this.minimalFeePerStorageByteMutez));
  }

  /**
   * @description  The limit on the amount of storage an [operation](https://tezos.gitlab.io/user/glossary.html#operations) can use.
   */
  get storageLimit() {
    const limit = Math.max(Number(this._storageLimit), 0);
    return limit > 0 ? limit : 0;
  }

  /**
   * @description The limit on the amount of [gas](https://tezos.gitlab.io/user/glossary.html#gas) a given operation can consume.
   */
  get gasLimit() {
    return this.roundUp(Number(this._milligasLimit)/1000 + GAS_BUFFER);
  }

  private get operationFeeMutez() {
    return (
      (Number(this._milligasLimit)/1000 + GAS_BUFFER) * MINIMAL_FEE_PER_GAS_MUTEZ + Number(this.opSize) * MINIMAL_FEE_PER_BYTE_MUTEZ
      );
  }

  private roundUp(nanotez: number) {
    return Math.ceil(Number(nanotez));
  }

  /**
   * @description Minimum fees for the [operation](https://tezos.gitlab.io/user/glossary.html#operations) according to [baker](https://tezos.gitlab.io/user/glossary.html#baker) defaults.
   */
  get minimalFeeMutez() {
    return this.roundUp(MINIMAL_FEE_MUTEZ + this.operationFeeMutez);
  }

  /**
   * @description The suggested fee for the operation which includes minimal fees and a small buffer.
   */
  get suggestedFeeMutez() {
    return this.roundUp(this.operationFeeMutez + MINIMAL_FEE_MUTEZ * 2);
  }

  /**
   * @description Fees according to your specified base fee will ensure that at least minimum fees are used.
   */
  get usingBaseFeeMutez() {
    return (
      Math.max(Number(this.baseFeeMutez), MINIMAL_FEE_MUTEZ) + this.roundUp(this.operationFeeMutez)
    );
  }

  /**
   * @description The sum of `minimalFeeMutez` + `burnFeeMutez`.
   */
  get totalCost() {
    return this.minimalFeeMutez + this.burnFeeMutez;
  }

  /**
   * @description Since Delphinet, consumed gas is provided in milligas for more precision. 
   * This function returns an estimation of the gas that operation will consume in milligas. 
   */
  get consumedMilligas() {
    return Number(this._milligasLimit);
  }

  static createEstimateInstanceFromProperties(estimateProperties: EstimateProperties[]) {
    let milligasLimit = 0;
    let storageLimit = 0;
    let opSize = 0;
    let minimalFeePerStorageByteMutez = 0;
    let baseFeeMutez: number | undefined;

    estimateProperties.forEach(estimate => {
      milligasLimit += estimate.milligasLimit;
      storageLimit += estimate.storageLimit;
      opSize += estimate.opSize;
      minimalFeePerStorageByteMutez = Math.max(estimate.minimalFeePerStorageByteMutez, minimalFeePerStorageByteMutez);
      if (estimate.baseFeeMutez) {
        baseFeeMutez = baseFeeMutez ? baseFeeMutez + estimate.baseFeeMutez : estimate.baseFeeMutez;
      }
    })
    return new Estimate(milligasLimit, storageLimit, opSize, minimalFeePerStorageByteMutez, baseFeeMutez);
  }

  static createArrayEstimateInstancesFromProperties(estimateProperties: EstimateProperties[]) {
    return estimateProperties.map(x => new Estimate(x.milligasLimit, x.storageLimit, x.opSize, x.minimalFeePerStorageByteMutez, x.baseFeeMutez))
  }
}
export class TezosPreapplyFailureError extends Error {
  name = 'TezosPreapplyFailureError';

  constructor(public result: any) {
    super('Preapply returned an unexpected result');
  }
}
export type RPCOpWithFee =
  | RPCTransferOperation
  | RPCOriginationOperation
  | RPCDelegateOperation
  | RPCRevealOperation
  | RPCRegisterGlobalConstantOperation;
export type RPCOpWithSource =
  | RPCTransferOperation
  | RPCOriginationOperation
  | RPCDelegateOperation
  | RPCRevealOperation
  | RPCRegisterGlobalConstantOperation;
export abstract class OperationEmitter {
  get rpc(): RpcClientInterface {
    return this.context.rpc;
  }

  get signer() {
    return this.context.signer;
  }

  constructor(protected context: Context) {}

  protected async isRevealOpNeeded(op: RPCOperation[] | ParamsWithKind[], pkh: string) {
    return !(await this.isAccountRevealRequired(pkh)) || !this.isRevealRequiredForOpType(op)
      ? false
      : true;
  }

  protected async isAccountRevealRequired(publicKeyHash: string) {
    const manager = await this.rpc.getManagerKey(publicKeyHash);
    const haveManager = manager && typeof manager === 'object' ? !!manager.key : !!manager;
    return !haveManager;
  }

  protected isRevealRequiredForOpType(op: RPCOperation[] | ParamsWithKind[]) {
    let opRequireReveal = false;
    for (const operation of op) {
      if (isOpRequireReveal(operation)) {
        opRequireReveal = true;
      }
    }
    return opRequireReveal;
  }

  // Originally from sotez (Copyright (c) 2018 Andrew Kishino)
  protected async prepareOperation({
    operation,
    source,
  }: PrepareOperationParams): Promise<PreparedOperation> {
    const counters: { [key: string]: number } = {};
    let ops: RPCOperation[] = [];

    const blockHeaderPromise = this.rpc.getBlockHeader({ block: 'head~2' });
    const blockMetaPromise = this.rpc.getBlockMetadata();

    if (Array.isArray(operation)) {
      ops = [...operation];
    } else {
      ops = [operation];
    }

    // Implicit account who emit the operation
    const publicKeyHash = await this.signer.publicKeyHash();
    let counterPromise: Promise<string | undefined> = Promise.resolve(undefined);

    for (let i = 0; i < ops.length; i++) {
      if (isOpRequireReveal(ops[i]) || ops[i].kind === 'reveal') {
        const { counter } = await this.rpc.getContract(publicKeyHash);
        counterPromise = Promise.resolve(counter);
        break;
      }
    }

    const [header, metadata, headCounter] = await Promise.all([
      blockHeaderPromise,
      blockMetaPromise,
      counterPromise,
    ]);

    if (!header) {
      throw new Error('Unable to fetch latest block header');
    }

    if (!metadata) {
      throw new Error('Unable to fetch latest metadata');
    }

    const head = header;

    const counter = parseInt(headCounter || '0', 10);
    if (!counters[publicKeyHash] || counters[publicKeyHash] < counter) {
      counters[publicKeyHash] = counter;
    }

    const getFee = (op: RPCOpWithFee) => {
      const opCounter = ++counters[publicKeyHash];
      return {
        counter: `${opCounter}`,
        fee: typeof op.fee === 'undefined' ? '0' : `${op.fee}`,
        gas_limit: typeof op.gas_limit === 'undefined' ? '0' : `${op.gas_limit}`,
        storage_limit: typeof op.storage_limit === 'undefined' ? '0' : `${op.storage_limit}`,
      };
    };

    const getSource = (op: RPCOpWithSource) => {
      return {
        source: typeof op.source === 'undefined' ? source || publicKeyHash : op.source,
      };
    };

    const constructOps = (cOps: RPCOperation[]): OperationContents[] =>
      cOps.map((op: RPCOperation) => {
        switch (op.kind) {
          case OpKind.ACTIVATION:
            return {
              ...op,
            };
          case OpKind.REVEAL:
            return {
              ...op,
              ...getSource(op),
              ...getFee(op),
            };
          case OpKind.ORIGINATION:
            return {
              ...op,
              balance: typeof op.balance !== 'undefined' ? `${op.balance}` : '0',
              ...getSource(op),
              ...getFee(op),
            };
          case OpKind.TRANSACTION: {
            const cops = {
              ...op,
              amount: typeof op.amount !== 'undefined' ? `${op.amount}` : '0',
              ...getSource(op),
              ...getFee(op),
            };
            if (cops.source.toLowerCase().startsWith('kt1')) {
              throw new Error(
                `KT1 addresses are not supported as source since ${Protocols.PsBabyM1}`
              );
            }
            return cops;
          }
          case OpKind.DELEGATION:
            return {
              ...op,
              ...getSource(op),
              ...getFee(op),
            };
          case OpKind.REGISTER_GLOBAL_CONSTANT:
            return {
              ...op,
              ...getSource(op),
              ...getFee(op),
            };
          default:
            throw new Error('Unsupported operation');
        }
      });

    const branch = head.hash;
    const contents = constructOps(ops);
    const protocol = metadata.next_protocol;

    return {
      opOb: {
        branch,
        contents,
        protocol,
      },
      counter,
    };
  }

  protected async forge({ opOb: { branch, contents, protocol }, counter }: PreparedOperation) {
    const forgedBytes = await this.context.forger.forge({ branch, contents });

    return {
      opbytes: forgedBytes,
      opOb: {
        branch,
        contents,
        protocol,
      },
      counter,
    };
  }

  protected async simulate(op: RPCRunOperationParam) {
    return {
      opResponse: await this.rpc.runOperation(op),
      op,
      context: this.context.clone(),
    };
  }

  protected async estimate<T extends { fee?: number; gasLimit?: number; storageLimit?: number }>(
    { fee, gasLimit, storageLimit, ...rest }: T,
    estimator: (param: T) => Promise<Estimate>
  ) {
    let calculatedFee = fee;
    let calculatedGas = gasLimit;
    let calculatedStorage = storageLimit;

    if (fee === undefined || gasLimit === undefined || storageLimit === undefined) {
      const estimation = await estimator({ fee, gasLimit, storageLimit, ...(rest as any) });

      if (calculatedFee === undefined) {
        calculatedFee = estimation.suggestedFeeMutez;
      }

      if (calculatedGas === undefined) {
        calculatedGas = estimation.gasLimit;
      }

      if (calculatedStorage === undefined) {
        calculatedStorage = estimation.storageLimit;
      }
    }

    return {
      fee: calculatedFee,
      gasLimit: calculatedGas,
      storageLimit: calculatedStorage,
    };
  }

  protected async signAndInject(forgedBytes: ForgedBytes) {
    const signed = await this.signer.sign(forgedBytes.opbytes, new Uint8Array([3]));
    forgedBytes.opbytes = signed.sbytes;
    forgedBytes.opOb.signature = signed.prefixSig;

    const opResponse: OperationContentsAndResult[] = [];
    const results = await this.rpc.preapplyOperations([forgedBytes.opOb]);

    if (!Array.isArray(results)) {
      throw new TezosPreapplyFailureError(results);
    }

    for (let i = 0; i < results.length; i++) {
      for (let j = 0; j < results[i].contents.length; j++) {
        opResponse.push(results[i].contents[j]);
      }
    }

    const errors = flattenErrors(results);

    if (errors.length) {
      throw new TezosOperationError(errors);
    }

    return {
      hash: await this.context.injector.inject(forgedBytes.opbytes),
      forgedBytes,
      opResponse,
      context: this.context.clone(),
    };
  }
}
const isErrorWithMessage = (error: any): error is TezosOperationErrorWithMessage => {
  return 'with' in error;
};
export interface TezosOperationErrorWithMessage extends TezosGenericOperationError {
  with: MichelsonV1ExpressionBase;
}
export class TezosOperationError extends Error {
  name = 'TezosOperationError';
  id: string;
  kind: string;

  constructor(public errors: TezosGenericOperationError[]) {
    super();
    // Last error is 'often' the one with more detail
    const lastError = errors[errors.length - 1];

    this.id = lastError.id;
    this.kind = lastError.kind;

    this.message = `(${this.kind}) ${this.id}`;

    if (isErrorWithMessage(lastError) && lastError.with.string) {
      this.message = lastError.with.string;
    }
  }
}
export const hasMetadataWithInternalOperationResult = <T extends { kind: OpKind }, K>(
  op: T
): op is T & {
  metadata: {
    internal_operation_results?: K;
  };
} => {
  return hasMetadata<T, any>(op) && 'internal_operation_results' in op.metadata;
};
export const flattenErrors = (
  response: PreapplyResponse | PreapplyResponse[],
  status = 'failed'
) => {
  const results = Array.isArray(response) ? response : [response];

  let errors: TezosGenericOperationError[] = [];
  // Transaction that do not fail will be backtracked in case one failure occur
  for (let i = 0; i < results.length; i++) {
    for (let j = 0; j < results[i].contents.length; j++) {
      const content = results[i].contents[j];
      if (hasMetadata(content)) {
        if (hasMetadataWithResult(content) && content.metadata.operation_result.status === status) {
          errors = errors.concat(content.metadata.operation_result.errors || []);
        }
        if (
          hasMetadataWithInternalOperationResult(content) &&
          Array.isArray(content.metadata.internal_operation_results)
        ) {
          for (const internalResult of content.metadata.internal_operation_results) {
            if ('result' in internalResult && internalResult.result.status === status) {
              errors = errors.concat(internalResult.result.errors || []);
            }
          }
        }
      }
    }
  }

  return errors;
};
export interface EstimationProvider {
  originate(params: OriginateParams): Promise<Estimate>;
  transfer({ fee, storageLimit, gasLimit, ...rest }: TransferParams): Promise<Estimate>;
  setDelegate(params: DelegateParams): Promise<Estimate>;
  registerDelegate(params?: RegisterDelegateParams): Promise<Estimate>;
  reveal(params?: RevealParams): Promise<Estimate | undefined> ;
  batch(params: ParamsWithKind[]): Promise<Estimate[]>;
  registerGlobalConstant(params: RegisterGlobalConstantParams): Promise<Estimate>;
}
export interface RevealParams {
  fee?: number;
  gasLimit?: number;
  storageLimit?: number;
}
export interface RegisterDelegateParams {
  fee?: number;
  gasLimit?: number;
  storageLimit?: number;
}
export function validateContractAddress(value: any): ValidationResult {
  return validatePrefixedValue(value, contractPrefix);
}
export class InvalidContractAddressError extends Error {
  public name = 'InvalidContractAddressError';
  constructor(public message: string) {
    super(message)
  }
}
export class HttpResponseError extends Error {
  public name = 'HttpResponse';

  constructor(
    public message: string,
    public status: STATUS_CODE,
    public statusText: string,
    public body: string,
    public url: string
  ) {
    super(message);
  }
}
export enum STATUS_CODE {
  CONTINUE = 100,
  SWITCHING_PROTOCOLS = 101,
  PROCESSING = 102,
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NON_AUTHORITATIVE_INFORMATION = 203,
  NO_CONTENT = 204,
  RESET_CONTENT = 205,
  PARTIAL_CONTENT = 206,
  MULTI_STATUS = 207,
  ALREADY_REPORTED = 208,
  IM_USED = 226,
  MULTIPLE_CHOICES = 300,
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  USE_PROXY = 305,
  SWITCH_PROXY = 306,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  I_AM_A_TEAPOT = 418,
  MISDIRECTED_REQUEST = 421,
  UNPROCESSABLE_ENTITY = 422,
  LOCKED = 423,
  FAILED_DEPENDENCY = 424,
  UPGRADE_REQUIRED = 426,
  PRECONDITION_REQUIRED = 428,
  TOO_MANY_REQUESTS = 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
  UNAVAILABLE_FOR_LEGAL_REASONS = 451,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
  VARIANT_ALSO_NEGOTIATES = 506,
  INSUFFICIENT_STORAGE = 507,
  LOOP_DETECTED = 508,
  NOT_EXTENDED = 510,
  NETWORK_AUTHENTICATION_REQUIRED = 511,
}
export class BigMapAbstraction {
  constructor(private id: BigNumber, private schema: Schema, private provider: ContractProvider) {}
  async get<T>(keyToEncode: BigMapKeyType, block?: number) {
    try {
      const id = await this.provider.getBigMapKeyByID<T>(
        this.id.toString(),
        keyToEncode,
        this.schema,
        block
      );
      return id;
    } catch (e) {
      if (e instanceof HttpResponseError && e.status === STATUS_CODE.NOT_FOUND) {
        return undefined;
      } else {
        throw e;
      }
    }
  }
  async getMultipleValues<T>(keysToEncode: Array<BigMapKeyType>, block?: number, batchSize = 5) {
    return this.provider.getBigMapKeysByID<T>(
      this.id.toString(),
      keysToEncode,
      this.schema,
      block,
      batchSize
    );
  }

  toJSON() {
    return this.id.toString();
  }

  toString() {
    return this.id.toString();
  }
}
export const smartContractAbstractionSemantic: (p: ContractProvider) => Semantic = (
  provider: ContractProvider
) => ({
  big_map: (val: MichelsonV1Expression, code: MichelsonV1Expression) => {
    if (!val || !('int' in val) || val.int === undefined) {
      return {};
    } else {
      const schema = new Schema(code);
      return new BigMapAbstraction(new BigNumber(val.int), schema, provider);
    }
  },
  sapling_state: (val: MichelsonV1Expression) => {
    if (!val || !('int' in val) || val.int === undefined) {
      return {};
    } else {
      return new SaplingStateAbstraction(new BigNumber(val.int), provider);
    }
  }
});
export class SaplingStateAbstraction {
    constructor(private id: BigNumber, private provider: ContractProvider) { }
    async getSaplingDiff(block?: number) {
        return this.provider.getSaplingDiffByID(this.id.toString(), block);
    }

    getId() {
        return this.id.toString();
    }
}
export const hex2buf = (hex: string): Uint8Array => {
  const match = hex.match(/[\da-f]{2}/gi);
  if (match) {
    return new Uint8Array(match.map((h) => parseInt(h, 16)));
  } else {
    throw new Error(`Unable to convert ${hex} to a Uint8Array`);
  }
};
import blake from 'blakejs';
export function encodeExpr(value: string) {
  const blakeHash = blake.blake2b(hex2buf(value), undefined, 32);
  return b58cencode(blakeHash, prefix['expr']);
}
export enum DEFAULT_FEE {
  DELEGATION = 1257,
  ORIGINATION = 10000,
  TRANSFER = 10000,
  REVEAL = 374,
}
export enum DEFAULT_GAS_LIMIT {
  DELEGATION = 10600,
  ORIGINATION = 10600,
  TRANSFER = 10600,
  REVEAL = 1100,
}
export enum DEFAULT_STORAGE_LIMIT {
  DELEGATION = 0,
  ORIGINATION = 257,
  TRANSFER = 257,
  REVEAL = 0,
}
export const createRevealOperation = async (
  {
    fee = DEFAULT_FEE.REVEAL,
    gasLimit = DEFAULT_GAS_LIMIT.REVEAL,
    storageLimit = DEFAULT_STORAGE_LIMIT.REVEAL,
  }: RevealParams,
  source: string,
  publicKey: string
) => {
  return {
    kind: OpKind.REVEAL,
    fee,
    public_key: publicKey,
    source,
    gas_limit: gasLimit,
    storage_limit: storageLimit,
  } as RPCRevealOperation;
};
export class InvalidCodeParameter extends Error {
  public name = 'InvalidCodeParameter';
  constructor(public message: string, public readonly data: any) {
    super(message);
  }
}
export interface Prim<PT extends string = string, AT extends Expr[] = Expr[]> extends Node {
  prim: PT;
  args?: AT;
  annots?: string[];
}
export interface StringLiteral extends Node {
  string: string;
}
export interface IntLiteral<T extends string = string> extends Node {
  int: T;
}
export interface BytesLiteral extends Node {
  bytes: string;
}
interface ExprList extends List<Expr> {}
export type List<T extends Expr> = T[] & Node;
export class InvalidInitParameter extends Error {
  public name = 'InvalidInitParameter';
  constructor(public message: string, public readonly data: any) {
    super(message);
  }
}
export type Expr = Prim | StringLiteral | IntLiteral | BytesLiteral | ExprList;
export function format(
  from: Format = 'mutez',
  to: Format = 'mutez',
  amount: number | string | BigNumber
) {
  const bigNum = new BigNumber(amount);
  if (bigNum.isNaN()) {
    return amount;
  }

  return bigNum
    .multipliedBy(Math.pow(10, getDecimal(from)))
    .dividedBy(Math.pow(10, getDecimal(to)));
}
const TZ_DECIMALS = 6;
const MTZ_DECIMALS = 3;
function getDecimal(format: Format) {
  switch (format) {
    case 'tz':
      return TZ_DECIMALS;
    case 'mtz':
      return MTZ_DECIMALS;
    case 'mutez':
    default:
      return 0;
  }
}
type Format = 'tz' | 'mtz' | 'mutez';
export const createOriginationOperation = async ({
  code,
  init,
  balance = '0',
  delegate,
  storage,
  fee = DEFAULT_FEE.ORIGINATION,
  gasLimit = DEFAULT_GAS_LIMIT.ORIGINATION,
  storageLimit = DEFAULT_STORAGE_LIMIT.ORIGINATION,
  mutez = false,
}: OriginateParams) => {
  if (storage !== undefined && init !== undefined) {
    throw new Error(
      'Storage and Init cannot be set a the same time. Please either use storage or init but not both.'
    );
  }

  if (!Array.isArray(code)) {
    throw new InvalidCodeParameter('Wrong code parameter type, expected an array', code);
  }

  let contractStorage: Expr | undefined;
  if (storage !== undefined) {
    const storageType = (code as Expr[]).find(
      (p): p is Prim => 'prim' in p && p.prim === 'storage'
    );
    if (storageType?.args === undefined) {
      throw new InvalidCodeParameter('The storage section is missing from the script', code);
    }
    const schema = new Schema(storageType.args[0] as MichelsonV1Expression); // TODO
    contractStorage = schema.Encode(storage);
  } else if (init !== undefined && typeof init === 'object') {
    contractStorage = init as Expr;
  } else {
    throw new InvalidInitParameter('Wrong init parameter type, expected JSON Michelson', init);
  }

  const script = {
    code,
    storage: contractStorage,
  };

  const operation: RPCOriginationOperation = {
    kind: OpKind.ORIGINATION,
    fee,
    gas_limit: gasLimit,
    storage_limit: storageLimit,
    balance: mutez ? balance.toString() : format('tz', 'mutez', balance).toString(),
    script,
  };

  if (delegate) {
    operation.delegate = delegate;
  }
  return operation;
};
export class InvalidAddressError extends Error {
  public name = 'InvalidAddressError';
  constructor(public message: string) {
    super(message)
  }
}
export class InvalidDelegationSource extends Error {
  name = 'Invalid delegation source error';

  constructor(public source: string) {
    super(
      `Since Babylon delegation source can no longer be a contract address ${source}. Please use the smart contract abstraction to set your delegate.`
    );
  }
}
export const createSetDelegateOperation = async ({
  delegate,
  source,
  fee = DEFAULT_FEE.DELEGATION,
  gasLimit = DEFAULT_GAS_LIMIT.DELEGATION,
  storageLimit = DEFAULT_STORAGE_LIMIT.DELEGATION,
}: DelegateParams) => {
  const operation: RPCDelegateOperation = {
    kind: OpKind.DELEGATION,
    source,
    fee,
    gas_limit: gasLimit,
    storage_limit: storageLimit,
    delegate,
  };
  return operation;
};
export class DelegateOperation extends Operation
  implements GasConsumingOperation, StorageConsumingOperation, FeeConsumingOperation {
  constructor(
    hash: string,
    private readonly params: RPCDelegateOperation,
    public readonly source: string,
    raw: ForgedBytes,
    results: OperationContentsAndResult[],
    context: Context
  ) {
    super(hash, raw, results, context);
  }

  get operationResults() {
    const delegationOp =
      Array.isArray(this.results) &&
      (this.results.find(op => op.kind === 'delegation') as OperationContentsAndResultDelegation);
    const result = delegationOp && delegationOp.metadata && delegationOp.metadata.operation_result;
    return result ? result : undefined;
  }

  get status() {
    const operationResults = this.operationResults;
    if (operationResults) {
      return operationResults.status;
    } else {
      return 'unknown';
    }
  }

  get delegate(): string {
    return this.delegate;
  }

  get isRegisterOperation(): boolean {
    return this.delegate === this.source;
  }

  get fee() {
    return this.params.fee;
  }

  get gasLimit() {
    return this.params.gas_limit;
  }

  get storageLimit() {
    return this.params.storage_limit;
  }

  get consumedGas() {
    const consumedGas = this.operationResults && this.operationResults.consumed_gas;
    return consumedGas ? consumedGas : undefined;
  }

  get errors() {
    return this.operationResults && this.operationResults.errors;
  }
}
export const createRegisterDelegateOperation = async (
  {
    fee = DEFAULT_FEE.DELEGATION,
    gasLimit = DEFAULT_GAS_LIMIT.DELEGATION,
    storageLimit = DEFAULT_STORAGE_LIMIT.DELEGATION,
  }: RegisterDelegateParams,
  source: string
) => {
  return {
    kind: OpKind.DELEGATION,
    fee,
    gas_limit: gasLimit,
    storage_limit: storageLimit,
    delegate: source,
  } as RPCDelegateOperation;
};
export const createTransferOperation = async ({
  to,
  amount,
  parameter,
  fee = DEFAULT_FEE.TRANSFER,
  gasLimit = DEFAULT_GAS_LIMIT.TRANSFER,
  storageLimit = DEFAULT_STORAGE_LIMIT.TRANSFER,
  mutez = false,
}: TransferParams) => {
  const operation: RPCTransferOperation = {
    kind: OpKind.TRANSACTION,
    fee,
    gas_limit: gasLimit,
    storage_limit: storageLimit,
    amount: mutez ? amount.toString() : format('tz', 'mutez', amount).toString(),
    destination: to,
    parameters: parameter,
  };
  return operation;
};
export class TransactionOperation extends Operation
  implements GasConsumingOperation, StorageConsumingOperation, FeeConsumingOperation {
  constructor(
    hash: string,
    private readonly params: RPCTransferOperation,
    public readonly source: string,
    raw: ForgedBytes,
    results: OperationContentsAndResult[],
    context: Context
  ) {
    super(hash, raw, results, context);
  }

  get operationResults() {
    const transactionOp =
      Array.isArray(this.results) &&
      (this.results.find(op => op.kind === 'transaction') as OperationContentsAndResultTransaction);
    return transactionOp ? [transactionOp] : [];
  }

  get status() {
    const operationResults = this.operationResults;
    const txResult = operationResults[0];
    if (txResult) {
      return txResult.metadata.operation_result.status;
    } else {
      return 'unknown';
    }
  }

  get amount() {
    return new BigNumber(this.params.amount);
  }

  get destination() {
    return this.params.destination;
  }

  get fee() {
    return this.params.fee;
  }

  get gasLimit() {
    return this.params.gas_limit;
  }

  get storageLimit() {
    return this.params.storage_limit;
  }

  private sumProp(arr: any[], prop: string) {
    return arr.reduce((prev, current) => {
      return prop in current ? Number(current[prop]) + prev : prev;
    }, 0);
  }

  get consumedGas() {
    return String(
      this.sumProp(flattenOperationResult({ contents: this.operationResults }), 'consumed_gas')
    );
  }

  get storageDiff() {
    return String(
      this.sumProp(
        flattenOperationResult({ contents: this.operationResults }),
        'paid_storage_size_diff'
      )
    );
  }

  get storageSize() {
    return String(
      this.sumProp(flattenOperationResult({ contents: this.operationResults }), 'storage_size')
    );
  }

  get errors() {
    return flattenErrors({ contents: this.operationResults });
  }
}
export class RevealOperation extends Operation
  implements GasConsumingOperation, StorageConsumingOperation, FeeConsumingOperation {
  constructor(
    hash: string,
    private readonly params: RPCRevealOperation,
    public readonly source: string,
    raw: ForgedBytes,
    results: OperationContentsAndResult[],
    context: Context
  ) {
    super(hash, raw, results, context);
  }

  get operationResults() {
    const revealOp =
      Array.isArray(this.results) &&
      (this.results.find(op => op.kind === 'reveal') as OperationContentsAndResultReveal);
    return revealOp ? [revealOp] : [];
  }

  get status() {
    const operationResults = this.operationResults;
    const txResult = operationResults[0];
    if (txResult) {
      return txResult.metadata.operation_result.status;
    } else {
      return 'unknown';
    }
  }

  get fee() {
    return this.params.fee;
  }

  get gasLimit() {
    return this.params.gas_limit;
  }

  get storageLimit() {
    return this.params.storage_limit;
  }

  get publicKey() {
    return this.params.public_key;
  }

  private sumProp(arr: any[], prop: string) {
    return arr.reduce((prev, current) => {
      return prop in current ? Number(current[prop]) + prev : prev;
    }, 0);
  }

  get consumedGas() {
    return String(
      this.sumProp(flattenOperationResult({ contents: this.operationResults }), 'consumed_gas')
    );
  }

  get storageDiff() {
    return String(
      this.sumProp(
        flattenOperationResult({ contents: this.operationResults }),
        'paid_storage_size_diff'
      )
    );
  }

  get storageSize() {
    return String(
      this.sumProp(flattenOperationResult({ contents: this.operationResults }), 'storage_size')
    );
  }

  get errors() {
    return flattenErrors({ contents: this.operationResults });
  }
}
export const createRegisterGlobalConstantOperation = async ({
  value,
  source,
  fee,
  gasLimit,
  storageLimit,
}: RegisterGlobalConstantParams) => {
  return {
    kind: OpKind.REGISTER_GLOBAL_CONSTANT,
    value,
    fee,
    gas_limit: gasLimit,
    storage_limit: storageLimit,
    source,
  } as RPCRegisterGlobalConstantOperation;
};
export class RegisterGlobalConstantOperation extends Operation
    implements GasConsumingOperation, StorageConsumingOperation, FeeConsumingOperation {

    /**
     * @description Hash (index) of the newly registered constant
     */
    public readonly globalConstantHash?: string;
    constructor(
        hash: string,
        private readonly params: RPCRegisterGlobalConstantOperation,
        public readonly source: string,
        raw: ForgedBytes,
        results: OperationContentsAndResult[],
        context: Context
    ) {
        super(hash, raw, results, context);

        this.globalConstantHash = this.operationResults && this.operationResults.global_address;
    }

    get operationResults() {
        const registerGlobalConstantOp =
            Array.isArray(this.results) &&
            (this.results.find(op => op.kind === 'register_global_constant') as OperationContentsAndResultRegisterGlobalConstant);
        const result = registerGlobalConstantOp && registerGlobalConstantOp.metadata && registerGlobalConstantOp.metadata.operation_result;
        return result ? result : undefined;
    }

    get status() {
        const operationResults = this.operationResults;
        if (operationResults) {
            return operationResults.status;
        } else {
            return 'unknown';
        }
    }

    get registeredExpression() {
        return this.params.value;
    }

    get fee() {
        return this.params.fee;
    }

    get gasLimit() {
        return this.params.gas_limit;
    }

    get storageLimit() {
        return this.params.storage_limit;
    }

    get errors() {
        return this.operationResults && this.operationResults.errors;
    }
}
export class RpcContractProvider extends OperationEmitter implements ContractProvider, StorageProvider {
  constructor(context: Context, private estimator: EstimationProvider) {
    super(context);
  }
  contractProviderTypeSymbol = Symbol.for('taquito--provider-type-symbol');

  async getStorage<T>(contract: string, schema?: ContractSchema): Promise<T> {
    if (validateContractAddress(contract) !== ValidationResult.VALID) {
      throw new InvalidContractAddressError(`Invalid contract address: ${contract}`);
    }
    if (!schema) {
      schema = await this.rpc.getNormalizedScript(contract);
    }

    let contractSchema: Schema;
    if (Schema.isSchema(schema)) {
      contractSchema = schema;
    } else {
      contractSchema = Schema.fromRPCResponse({ script: schema as ScriptResponse });
    }

    const storage = await this.rpc.getStorage(contract);

    return contractSchema.Execute(storage, smartContractAbstractionSemantic(this)) as T; // Cast into T because only the caller can know the true type of the storage
  }

  async getBigMapKey<T>(contract: string, key: string, schema?: ContractSchema): Promise<T> {
    if (validateContractAddress(contract) !== ValidationResult.VALID) {
      throw new InvalidContractAddressError(`Invalid contract address: ${contract}`);
    }
    if (!schema) {
      schema = await this.rpc.getNormalizedScript(contract);
    }

    let contractSchema: Schema;
    if (Schema.isSchema(schema)) {
      contractSchema = schema;
    } else {
      contractSchema = Schema.fromRPCResponse({ script: schema as ScriptResponse });
    }

    const encodedKey = contractSchema.EncodeBigMapKey(key);

    const val = await this.rpc.getBigMapKey(contract, encodedKey);

    return contractSchema.ExecuteOnBigMapValue(val) as T; // Cast into T because only the caller can know the true type of the storage
  }

  async getBigMapKeyByID<T>(
    id: string,
    keyToEncode: BigMapKeyType,
    schema: Schema,
    block?: number
  ): Promise<T> {
    const { key, type } = schema.EncodeBigMapKey(keyToEncode);
    const { packed } = await this.context.packer.packData({ data: key, type });

    const encodedExpr = encodeExpr(packed);

    const bigMapValue = block
      ? await this.context.rpc.getBigMapExpr(id.toString(), encodedExpr, { block: String(block) })
      : await this.context.rpc.getBigMapExpr(id.toString(), encodedExpr);

    return schema.ExecuteOnBigMapValue(bigMapValue, smartContractAbstractionSemantic(this)) as T;
  }

  async getBigMapKeysByID<T>(
    id: string,
    keys: Array<BigMapKeyType>,
    schema: Schema,
    block?: number,
    batchSize = 5
  ): Promise<MichelsonMap<MichelsonMapKey, T | undefined>> {
    const level = await this.getBlockForRequest(keys, block);
    const bigMapValues = new MichelsonMap<MichelsonMapKey, T | undefined>();

    // Execute batch of promises in series
    let position = 0;
    let results: Array<T | undefined> = [];

    while (position < keys.length) {
      const keysBatch = keys.slice(position, position + batchSize);
      const batch = keysBatch.map((keyToEncode) =>
        this.getBigMapValueOrUndefined<T>(keyToEncode, id, schema, level)
      );
      results = [...results, ...(await Promise.all(batch))];
      position += batchSize;
    }

    for (let i = 0; i < results.length; i++) {
      bigMapValues.set(keys[i], results[i]);
    }

    return bigMapValues;
  }

  private async getBlockForRequest(keys: Array<BigMapKeyType>, block?: number) {
    return keys.length === 1 || typeof block !== 'undefined'
      ? block
      : (await this.rpc.getBlock())?.header.level;
  }

  private async getBigMapValueOrUndefined<T>(
    keyToEncode: BigMapKeyType,
    id: string,
    schema: Schema,
    level?: number
  ) {
    try {
      return await this.getBigMapKeyByID<T>(id, keyToEncode, schema, level);
    } catch (ex) {
      if (ex instanceof HttpResponseError && ex.status === STATUS_CODE.NOT_FOUND) {
        return;
      } else {
        throw ex;
      }
    }
  }

  async getSaplingDiffByID(id: string, block?: number) {
    const saplingState = block
      ? await this.context.rpc.getSaplingDiffById(id.toString(), { block: String(block) })
      : await this.context.rpc.getSaplingDiffById(id.toString());
    return saplingState;
  }

  private async addRevealOperationIfNeeded(operation: RPCOperation, publicKeyHash: string) {
    if (isOpRequireReveal(operation)) {
      const ops: RPCOperation[] = [operation];
      const publicKey = await this.signer.publicKey();
      const estimateReveal = await this.estimator.reveal();
      if (estimateReveal) {
        const reveal: withKind<RevealParams, OpKind.REVEAL> = { kind: OpKind.REVEAL };
        const estimatedReveal = await this.estimate(reveal, async () => estimateReveal);
        ops.unshift(await createRevealOperation({ ...estimatedReveal }, publicKeyHash, publicKey));
        return ops;
      }
    }
    return operation;
  }

  async originate<TContract extends DefaultContractType = DefaultContractType>(params: OriginateParams<ContractStorageType<TContract>>) {
    const estimate = await this.estimate(params, this.estimator.originate.bind(this.estimator));

    const publicKeyHash = await this.signer.publicKeyHash();
    const operation = await createOriginationOperation(
      await this.context.parser.prepareCodeOrigination({
        ...params,
        ...estimate,
      })
    );
    const ops = await this.addRevealOperationIfNeeded(operation, publicKeyHash);
    const preparedOrigination = await this.prepareOperation({
      operation: ops,
      source: publicKeyHash,
    });
    const forgedOrigination = await this.forge(preparedOrigination);
    const { hash, context, forgedBytes, opResponse } = await this.signAndInject(forgedOrigination);
    return new OriginationOperation<TContract>(hash, operation, forgedBytes, opResponse, context, this);
  }

  async setDelegate(params: DelegateParams) {
    if ( params.source && validateAddress(params.source) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid source Address: ${params.source}`);
    }
    if (params.delegate && validateAddress(params.delegate) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid delegate Address: ${params.delegate}`);
    }

    if (/kt1/i.test(params.source)) {
      throw new InvalidDelegationSource(params.source);
    }

    const estimate = await this.estimate(params, this.estimator.setDelegate.bind(this.estimator));
    const publicKeyHash = await this.signer.publicKeyHash();
    const operation = await createSetDelegateOperation({ ...params, ...estimate });
    const sourceOrDefault = params.source || publicKeyHash;
    const ops = await this.addRevealOperationIfNeeded(operation, publicKeyHash);
    const prepared = await this.prepareOperation({
      operation: ops,
      source: sourceOrDefault,
    });
    const opBytes = await this.forge(prepared);
    const { hash, context, forgedBytes, opResponse } = await this.signAndInject(opBytes);
    return new DelegateOperation(
      hash,
      operation,
      sourceOrDefault,
      forgedBytes,
      opResponse,
      context
    );
  }

  async registerDelegate(params: RegisterDelegateParams) {
    const estimate = await this.estimate(
      params,
      this.estimator.registerDelegate.bind(this.estimator)
    );
    const source = await this.signer.publicKeyHash();
    const operation = await createRegisterDelegateOperation({ ...params, ...estimate }, source);
    const ops = await this.addRevealOperationIfNeeded(operation, source);
    const prepared = await this.prepareOperation({ operation: ops });
    const opBytes = await this.forge(prepared);
    const { hash, context, forgedBytes, opResponse } = await this.signAndInject(opBytes);
    return new DelegateOperation(hash, operation, source, forgedBytes, opResponse, context);
  }

  async transfer(params: TransferParams) {
    if (validateAddress(params.to) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid address passed in 'to' parameter: ${params.to}`);
    }
    if (params.source && validateAddress(params.source) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid address passed in 'source' parameter: ${params.source}`);
    }

    const publickKeyHash = await this.signer.publicKeyHash();
    const estimate = await this.estimate(params, this.estimator.transfer.bind(this.estimator));
    const operation = await createTransferOperation({
      ...params,
      ...estimate,
    });
    const source = params.source || publickKeyHash;
    const ops = await this.addRevealOperationIfNeeded(operation, publickKeyHash);
    const prepared = await this.prepareOperation({ operation: ops, source: params.source });
    const opBytes = await this.forge(prepared);
    const { hash, context, forgedBytes, opResponse } = await this.signAndInject(opBytes);
    return new TransactionOperation(hash, operation, source, forgedBytes, opResponse, context);
  }

  async reveal(params: RevealParams) {
    const publicKeyHash = await this.signer.publicKeyHash();
    const estimateReveal = await this.estimator.reveal(params);
    if (estimateReveal) {
      const estimated = await this.estimate(params, async () => estimateReveal);
      const operation = await createRevealOperation(
        {
          ...estimated,
        },
        publicKeyHash,
        await this.signer.publicKey()
      );
      const prepared = await this.prepareOperation({ operation, source: publicKeyHash });
      const opBytes = await this.forge(prepared);
      const { hash, context, forgedBytes, opResponse } = await this.signAndInject(opBytes);
      return new RevealOperation(hash, operation, publicKeyHash, forgedBytes, opResponse, context);
    } else {
      throw new Error('The current address is already revealed.');
    }
  }

  async registerGlobalConstant(params: RegisterGlobalConstantParams) {
    const publickKeyHash = await this.signer.publicKeyHash();
    const estimate = await this.estimate(
      params,
      this.estimator.registerGlobalConstant.bind(this.estimator)
    );
    const operation = await createRegisterGlobalConstantOperation({
      ...params,
      ...estimate,
    });
    const ops = await this.addRevealOperationIfNeeded(operation, publickKeyHash);
    const prepared = await this.prepareOperation({ operation: ops, source: publickKeyHash });
    const opBytes = await this.forge(prepared);
    const { hash, context, forgedBytes, opResponse } = await this.signAndInject(opBytes);
    return new RegisterGlobalConstantOperation(
      hash,
      operation,
      publickKeyHash,
      forgedBytes,
      opResponse,
      context
    );
  }

  async at<T extends DefaultContractType = DefaultContractType>(
    address: string,
    contractAbstractionComposer: ContractAbstractionComposer<T> = (x) => x as any
  ): Promise<T> {
    if (validateContractAddress(address) !== ValidationResult.VALID) {
      throw new InvalidContractAddressError(`Invalid contract address: ${address}`);
    }
    const rpc = this.context.withExtensions().rpc;
    const script = await rpc.getNormalizedScript(address);
    const entrypoints = await rpc.getEntrypoints(address);
    const blockHeader = await this.rpc.getBlockHeader();
    const chainId = blockHeader.chain_id;
    const abs = new ContractAbstraction(address, script, this, this, entrypoints, chainId, rpc);
    return contractAbstractionComposer(abs, this.context);
  }

  batch(params?: ParamsWithKind[]) {
    const batch = new OperationBatch(this.context, this.estimator);

    if (Array.isArray(params)) {
      batch.with(params);
    }

    return batch;
  }
}
export function validateKeyHash(value: any): ValidationResult {
  return validatePrefixedValue(value, implicitPrefix);
}
export class InvalidKeyHashError extends Error {
  public name = 'InvalidKeyHashError';
  constructor(public message: string) {
    super(message)
  }
}
export class OperationBatch extends OperationEmitter {
  private operations: ParamsWithKind[] = [];

  constructor(context: Context, private estimator: EstimationProvider) {
    super(context);
  }

  /**
   *
   * @description Add a transaction operation to the batch
   *
   * @param params Transfer operation parameter
   */
  withTransfer(params: TransferParams) {
    if (validateAddress(params.to) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid 'to' address: ${params.to}`)
    }
    this.operations.push({ kind: OpKind.TRANSACTION, ...params });
    return this;
  }

  /**
   *
   * @description Add a transaction operation to the batch
   *
   * @param params Transfer operation parameter
   */
  withContractCall(params: ContractMethod<ContractProvider> | ContractMethodObject<ContractProvider>) {
    return this.withTransfer(params.toTransferParams());
  }

  /**
   *
   * @description Add a delegation operation to the batch
   *
   * @param params Delegation operation parameter
   */
  withDelegation(params: DelegateParams) {
    if (params.source && validateAddress(params.source) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid source address: ${params.source}`);
    }
    if (params.delegate && validateAddress(params.delegate) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid delegate address: ${params.delegate}`);
    }
    this.operations.push({ kind: OpKind.DELEGATION, ...params });
    return this;
  }

  /**
   *
   * @description Add an activation operation to the batch
   *
   * @param params Activation operation parameter
   */
  withActivation({ pkh, secret }: ActivationParams) {
    if (validateKeyHash(pkh) !== ValidationResult.VALID) {
      throw new InvalidKeyHashError(`Invalid Key Hash: ${pkh}`);
    }
    this.operations.push({ kind: OpKind.ACTIVATION, pkh, secret });
    return this;
  }

  /**
   *
   * @description Add an origination operation to the batch
   *
   * @param params Origination operation parameter
   */
  withOrigination<TContract extends DefaultContractType = DefaultContractType>(params: OriginateParams<ContractStorageType<TContract>>) {
    this.operations.push({ kind: OpKind.ORIGINATION, ...params });
    return this;
  }

  /**
   *
   * @description Add an operation to register a global constant to the batch
   *
   * @param params RegisterGlobalConstant operation parameter
   */
   withRegisterGlobalConstant(params: RegisterGlobalConstantParams) {
    this.operations.push({ kind: OpKind.REGISTER_GLOBAL_CONSTANT, ...params });
    return this;
  }

  private async getRPCOp(param: ParamsWithKind) {
    switch (param.kind) {
      case OpKind.TRANSACTION:
        return createTransferOperation({
          ...param,
        });
      case OpKind.ORIGINATION:
        return createOriginationOperation(
          await this.context.parser.prepareCodeOrigination({
          ...param,
        }));
      case OpKind.DELEGATION:
        return createSetDelegateOperation({
          ...param,
        });
      case OpKind.ACTIVATION:
        return {
          ...param,
        };
      case OpKind.REGISTER_GLOBAL_CONSTANT:
        return createRegisterGlobalConstantOperation({
          ...param,
        });
      default:
        throw new Error(`Unsupported operation kind: ${(param as any).kind}`);
    }
  }

  /**
   *
   * @description Add a group operation to the batch. Operation will be applied in the order they are in the params array
   *
   * @param params Operations parameter
   */
  with(params: ParamsWithKind[]) {
    for (const param of params) {
      switch (param.kind) {
        case OpKind.TRANSACTION:
          this.withTransfer(param);
          break;
        case OpKind.ORIGINATION:
          this.withOrigination(param);
          break;
        case OpKind.DELEGATION:
          this.withDelegation(param);
          break;
        case OpKind.ACTIVATION:
          this.withActivation(param);
          break;
        case OpKind.REGISTER_GLOBAL_CONSTANT:
          this.withRegisterGlobalConstant(param);
          break;
        default:
          throw new Error(`Unsupported operation kind: ${(param as any).kind}`);
      }
    }

    return this;
  }

  /**
   *
   * @description Forge and Inject the operation batch
   *
   * @param params Optionally specify the source of the operation
   */
  async send(params?: { source?: string }) {
    const publicKeyHash = await this.signer.publicKeyHash();
    const publicKey = await this.signer.publicKey();
    const estimates = await this.estimator.batch(this.operations);

    const revealNeeded = await this.isRevealOpNeeded(this.operations, publicKeyHash);
    let i = revealNeeded ? 1 : 0;

    const ops: RPCOperation[] = [];
    for (const op of this.operations) {
      if (isOpWithFee(op)) {
        const estimated = await this.estimate(op, async () => estimates[i]);
        ops.push(await this.getRPCOp({ ...op, ...estimated }));
      } else {
        ops.push({ ...op });
      }
      i++;
    }
    if (revealNeeded) {
      const reveal: withKind<RevealParams, OpKind.REVEAL> = { kind: OpKind.REVEAL }
      const estimatedReveal = await this.estimate(reveal, async () => estimates[0]);
      ops.unshift(await createRevealOperation({ ...estimatedReveal }, publicKeyHash, publicKey))
    }

    const source = (params && params.source) || publicKeyHash;
    const prepared = await this.prepareOperation({
      operation: ops,
      source,
    });
    const opBytes = await this.forge(prepared);
    const { hash, context, forgedBytes, opResponse } = await this.signAndInject(opBytes);
    return new BatchOperation(hash, ops, source, forgedBytes, opResponse, context);
  }
}
export class BatchOperation
  extends Operation
  implements GasConsumingOperation, StorageConsumingOperation, FeeConsumingOperation
{
  constructor(
    hash: string,
    private readonly params: RPCOperation[],
    public readonly source: string,
    raw: ForgedBytes,
    results: OperationContentsAndResult[],
    context: Context
  ) {
    super(hash, raw, results, context);
  }

  private sumProp(arr: any[], prop: string) {
    return arr.reduce((prev, current) => {
      return prop in current ? Number(current[prop]) + prev : prev;
    }, 0);
  }

  public get status() {
    return (
      this.results
        .filter((result) => BATCH_KINDS.indexOf(result.kind) !== -1)
        .map((result) => {
          if (hasMetadataWithResult(result)) {
            return result.metadata.operation_result.status;
          } else {
            return 'unknown';
          }
        })[0] || 'unknown'
    );
  }

  get fee() {
    return this.sumProp(this.params, 'fee');
  }

  get gasLimit() {
    return this.sumProp(this.params, 'gas_limit');
  }

  get storageLimit() {
    return this.sumProp(this.params, 'storage_limit');
  }

  get consumedGas() {
    return String(this.sumProp(flattenOperationResult({ contents: this.results }), 'consumed_gas'));
  }

  get storageDiff() {
    return String(
      this.sumProp(flattenOperationResult({ contents: this.results }), 'paid_storage_size_diff')
    );
  }

  get errors() {
    return flattenErrors({ contents: this.results });
  }
}
export const isOpWithFee = <T extends { kind: OpKind }>(
  op: T
): op is withKind<T, InternalOperationResultKindEnum> => {
  return ['transaction', 'delegation', 'origination', 'reveal', 'register_global_constant'].indexOf(op.kind) !== -1;
};
export interface ContractProvider extends StorageProvider {
  originate<TContract extends DefaultContractType = DefaultContractType>(contract: OriginateParams<ContractStorageType<TContract>>): Promise<OriginationOperation<TContract>>;
  setDelegate(params: DelegateParams): Promise<DelegateOperation>;
  registerDelegate(params: RegisterDelegateParams): Promise<DelegateOperation>;
  transfer(params: TransferParams): Promise<TransactionOperation>;
  reveal(params: RevealParams): Promise<RevealOperation>;
  at<T extends ContractAbstraction<ContractProvider>>(address: string, contractAbstractionComposer?: (abs: ContractAbstraction<ContractProvider>, context: Context) => T): Promise<T>;
  batch(params?: ParamsWithKind[]): OperationBatch ;
  registerGlobalConstant(params: RegisterGlobalConstantParams): Promise<RegisterGlobalConstantOperation>;
}
export interface SendParams {
    fee?: number;
    storageLimit?: number;
    gasLimit?: number;
    amount: number;
    source?: string;
    mutez?: boolean;
}
export interface ContractMethodInterface {
    send(params: Partial<SendParams>): Promise<TransactionWalletOperation | TransactionOperation>;
    toTransferParams(params: Partial<SendParams>): TransferParams;
}
export class ParameterSchema {
  private root: Token;

  static fromRPCResponse(val: { script: ScriptResponse }) {
    const parameter: Falsy<MichelsonV1ExpressionExtended> =
      val &&
      val.script &&
      Array.isArray(val.script.code) &&
      (val.script.code.find((x: any) => x.prim === 'parameter') as MichelsonV1ExpressionExtended);
    if (!parameter || !Array.isArray(parameter.args)) {
      throw new Error('Invalid rpc response passed as arguments');
    }

    return new ParameterSchema(parameter.args[0]);
  }

  get isMultipleEntryPoint() {
    return (
      this.root instanceof OrToken ||
      (this.root instanceof OptionToken && this.root.subToken() instanceof OrToken)
    );
  }

  get hasAnnotation() {
    if (this.isMultipleEntryPoint) {
      return Object.keys(this.ExtractSchema())[0] !== '0';
    } else {
      return true;
    }
  }

  constructor(val: MichelsonV1Expression) {
    this.root = createToken(val, 0);
  }

  Execute(val: any, semantics?: Semantic) {
    return this.root.Execute(val, semantics);
  }

  // Encode(...args: any[]) {
  //   try {
  //     return this.root.Encode(args.reverse());
  //   } catch (ex) {
  //     if (ex instanceof TokenValidationError) {
  //       throw ex;
  //     }

  //     throw new Error(`Unable to encode parameter. ${ex}`);
  //   }
  // }

  // EncodeObject(_value?: any) {
  //   try {
  //     return this.root.EncodeObject(_value);
  //   } catch (ex) {
  //     if (ex instanceof TokenValidationError) {
  //       throw ex;
  //     }

  //     throw new Error(`Unable to encode parameter object. ${ex}`);
  //   }
  // }
  ExtractSchema() {
    return this.root.ExtractSchema();
  }
  generateSchema(): TokenSchema {
    return this.root.generateSchema();
  }

  ExtractSignatures() {
    return this.root.ExtractSignature();
  }
}
export type ExplicitTransferParams = Required<Omit<TransferParams, keyof SendParams>> & SendParams;
export class ContractMethodObject<T extends ContractProvider | Wallet> implements ContractMethodInterface {
    constructor(
        private provider: T,
        private address: string,
        private parameterSchema: ParameterSchema,
        private name: string,
        private args: any = 'unit',
        private isMultipleEntrypoint = true,
        private isAnonymous = false
    ) { }

    /**
     * @description Get the signature of the smart contract method
     */
    getSignature() {
        return this.isAnonymous
            ? this.parameterSchema.ExtractSchema()[this.name]
            : this.parameterSchema.ExtractSchema();
    }

    /**
     *
     * @description Send the smart contract operation
     *
     * @param Options generic operation parameter
     */
    send(
        params: Partial<SendParams> = {}
    ): Promise<T extends Wallet ? TransactionWalletOperation : TransactionOperation> {
        if (this.provider instanceof Wallet) {
            return (this.provider as unknown as Wallet).transfer(this.toTransferParams(params)).send() as any;
        } else {
            return this.provider.transfer(this.toTransferParams(params)) as any;
        }
    }

    /**
     *
     * @description Create transfer params to be used with TezosToolkit.contract.transfer methods
     *
     * @param Options generic transfer operation parameters
     */
    toTransferParams({
        fee,
        gasLimit,
        storageLimit,
        source,
        amount = 0,
        mutez = false,
    }: Partial<SendParams> = {}): TransferParams {
        const fullTransferParams: ExplicitTransferParams = {
            to: this.address,
            amount,
            fee,
            mutez,
            source,
            gasLimit,
            storageLimit,
            parameter: {
                entrypoint: this.isMultipleEntrypoint ? this.name : DEFAULT_SMART_CONTRACT_METHOD_NAME,
                value: this.isAnonymous
                    ? this.parameterSchema.EncodeObject({ [this.name]: this.args })
                    : this.parameterSchema.EncodeObject(this.args),
            },
        };
        return fullTransferParams;
    }
}
export class InvalidParameterError extends Error {
  name = 'Invalid parameters error';
  constructor(public smartContractMethodName: string, public sigs: any[], public args: any[]) {
    super(
      `${smartContractMethodName} Received ${
        args.length
      } arguments while expecting one of the following signatures (${JSON.stringify(sigs)})`
    );
  }
}
export const DEFAULT_SMART_CONTRACT_METHOD_NAME = 'default';
export class ContractMethod<T extends ContractProvider | Wallet>
  implements ContractMethodInterface
{
  constructor(
    private provider: T,
    private address: string,
    private parameterSchema: ParameterSchema,
    private name: string,
    private args: any[],
    private isMultipleEntrypoint = true,
    private isAnonymous = false
  ) {}

  private validateArgs(args: any[], schema: ParameterSchema, name: string) {
    const sigs = schema.ExtractSignatures();

    if (!sigs.find((x: any[]) => x.length === args.length)) {
      throw new InvalidParameterError(name, sigs, args);
    }
  }

  /**
   * @description Get the schema of the smart contract method
   */
  get schema() {
    return this.isAnonymous
      ? this.parameterSchema.ExtractSchema()[this.name]
      : this.parameterSchema.ExtractSchema();
  }

  /**
   * @description Get the signature of the smart contract method
   */
  getSignature() {
    if (this.isAnonymous) {
      const sig = this.parameterSchema.ExtractSignatures().find((x: any[]) => x[0] === this.name);
      if (sig) {
        sig.shift();
        return sig;
      }
    } else {
      const sig = this.parameterSchema.ExtractSignatures();
      return sig.length == 1 ? sig[0] : sig;
    }
  }

  /**
   *
   * @description Send the smart contract operation
   *
   * @param Options generic operation parameter
   */
  send(
    params: Partial<SendParams> = {}
  ): Promise<T extends Wallet ? TransactionWalletOperation : TransactionOperation> {
    if (this.provider instanceof Wallet) {
      return (this.provider as unknown as Wallet)
        .transfer(this.toTransferParams(params))
        .send() as any;
    } else {
      return this.provider.transfer(this.toTransferParams(params)) as any;
    }
  }

  /**
   *
   * @description Create transfer params to be used with TezosToolkit.contract.transfer methods
   *
   * @param Options generic transfer operation parameters
   */
  toTransferParams({
    fee,
    gasLimit,
    storageLimit,
    source,
    amount = 0,
    mutez = false,
  }: Partial<SendParams> = {}): TransferParams {
    const fullTransferParams: ExplicitTransferParams = {
      to: this.address,
      amount,
      fee,
      mutez,
      source,
      gasLimit,
      storageLimit,
      parameter: {
        entrypoint: this.isMultipleEntrypoint ? this.name : DEFAULT_SMART_CONTRACT_METHOD_NAME,
        value: this.isAnonymous
          ? this.parameterSchema.Encode(this.name, ...this.args)
          : this.parameterSchema.Encode(...this.args),
      },
    };
    return fullTransferParams;
  }
}
type ContractAbstractionComposer<T> = (
  abs: ContractAbstraction<ContractProvider>,
  context: Context
) => T;
export class OriginationOperation<TContract extends DefaultContractType = DefaultContractType> 
  extends Operation
  implements GasConsumingOperation, StorageConsumingOperation, FeeConsumingOperation {
  /**
   * @description Contract address of the newly originated contract
   */
  public readonly contractAddress?: string;

  constructor(
    hash: string,
    private readonly params: RPCOriginationOperation,
    raw: ForgedBytes,
    results: OperationContentsAndResult[],
    context: Context,
    private contractProvider: RpcContractProvider
  ) {
    super(hash, raw, results, context);

    const originatedContracts = this.operationResults && this.operationResults.originated_contracts;
    if (Array.isArray(originatedContracts)) {
      this.contractAddress = originatedContracts[0];
    }
  }

  get status() {
    const operationResults = this.operationResults;
    if (operationResults) {
      return operationResults.status;
    } else {
      return 'unknown';
    }
  }

  get operationResults() {
    const originationOp =
      Array.isArray(this.results) &&
      (this.results.find((op) => op.kind === 'origination') as
        | OperationContentsAndResultOrigination
        | undefined);

    const result =
      originationOp &&
      hasMetadataWithResult(originationOp) &&
      originationOp.metadata.operation_result;
    return result ? result : undefined;
  }

  get fee() {
    return this.params.fee;
  }

  get gasLimit() {
    return this.params.gas_limit;
  }

  get storageLimit() {
    return this.params.storage_limit;
  }

  get consumedGas() {
    const consumedGas = this.operationResults && this.operationResults.consumed_gas;
    return consumedGas ? consumedGas : undefined;
  }

  get storageDiff() {
    const storageDiff = this.operationResults && this.operationResults.paid_storage_size_diff;
    return storageDiff ? storageDiff : undefined;
  }

  get storageSize() {
    const storageSize = this.operationResults && this.operationResults.storage_size;
    return storageSize ? storageSize : undefined;
  }

  get errors() {
    return this.operationResults && this.operationResults.errors;
  }

  /**
   * @description Provide the contract abstract of the newly originated contract
   */
  async contract(confirmations?: number, interval?: number, timeout?: number) {
    if (!this.contractAddress) {
      throw new Error('No contract was originated in this operation');
    }

    await this.confirmation(confirmations, interval, timeout);
    return this.contractProvider.at<TContract>(this.contractAddress);
  }
}
export interface PKHOption {
  forceRefetch?: boolean;
}
export type WalletParamsWithKind =
  | withKind<WalletTransferParams, OpKind.TRANSACTION>
  | withKind<WalletOriginateParams, OpKind.ORIGINATION>
  | withKind<WalletDelegateParams, OpKind.DELEGATION>;
export class WalletOperationBatch {
  private operations: WalletParamsWithKind[] = [];

  constructor(private walletProvider: WalletProvider, private context: Context) {}

  /**
   *
   * @description Add a transaction operation to the batch
   *
   * @param params Transfer operation parameter
   */
  withTransfer(params: WalletTransferParams) {
    if (validateAddress(params.to) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid 'to' address: ${params.to}`)
    }
    this.operations.push({ kind: OpKind.TRANSACTION, ...params });
    return this;
  }

  /**
   *
   * @description Add a transaction operation to the batch
   *
   * @param params Transfer operation parameter
   */
  withContractCall(params: ContractMethod<Wallet> | ContractMethodObject<Wallet>) {
    return this.withTransfer(params.toTransferParams());
  }

  /**
   *
   * @description Add a delegation operation to the batch
   *
   * @param params Delegation operation parameter
   */
  withDelegation(params: WalletDelegateParams) {
    if (params.delegate && validateAddress(params.delegate) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid delegate address: ${params.delegate}`);
    }
    this.operations.push({ kind: OpKind.DELEGATION, ...params });
    return this;
  }

  /**
   *
   * @description Add an origination operation to the batch
   *
   * @param params Origination operation parameter
   */
  withOrigination<TWallet extends DefaultWalletType = DefaultWalletType>(params: WalletOriginateParams<ContractStorageType<TWallet>>) {
    this.operations.push({ kind: OpKind.ORIGINATION, ...params });
    return this;
  }

  private async mapOperation(param: WalletParamsWithKind) {
    switch (param.kind) {
      case OpKind.TRANSACTION:
        return this.walletProvider.mapTransferParamsToWalletParams(async () => param);
      // case OpKind.ORIGINATION:
      //   return this.walletProvider.mapOriginateParamsToWalletParams(async () =>
      //     this.context.parser.prepareCodeOrigination({
      //       ...param,
      //     })
      //   );
      case OpKind.DELEGATION:
        return this.walletProvider.mapDelegateParamsToWalletParams(async () => param);
      default:
        throw new Error(`Unsupported operation kind: ${(param as any).kind}`);
    }
  }

  /**
   *
   * @description Add a group operation to the batch. Operation will be applied in the order they are in the params array
   *
   * @param params Operations parameter
   */
  with(params: WalletParamsWithKind[]) {
    for (const param of params) {
      switch (param.kind) {
        case OpKind.TRANSACTION:
          this.withTransfer(param);
          break;
        case OpKind.ORIGINATION:
          this.withOrigination(param);
          break;
        case OpKind.DELEGATION:
          this.withDelegation(param);
          break;
        default:
          throw new Error(`Unsupported operation kind: ${(param as any).kind}`);
      }
    }

    return this;
  }

  async send() {
    const ops: WalletParamsWithKind[] = [];

    for (const op of this.operations) {
      ops.push(await this.mapOperation(op));
    }

    const opHash = await this.walletProvider.sendOperations(ops);

    return this.context.operationFactory.createBatchOperation(opHash);
  }
}
export class Wallet {
  constructor(private context: Context) {}

  private get walletProvider() {
    return this.context.walletProvider;
  }

  private _pkh?: string;

  /**
   * @description Retrieve the PKH of the account that is currently in use by the wallet
   *
   * @param option Option to use while fetching the PKH.
   * If forceRefetch is specified the wallet provider implementation will refetch the PKH from the wallet
   */
  async pkh({ forceRefetch }: PKHOption = {}) {
    if (!this._pkh || forceRefetch) {
      this._pkh = await this.walletProvider.getPKH();
    }

    return this._pkh;
  }

  private walletCommand = <T>(send: () => Promise<T>) => {
    return {
      send,
    };
  };

  /**
   *
   * @description Originate a new contract according to the script in parameters.
   *
   * @returns An operation handle with the result from the rpc node
   *
   * @param originateParams Originate operation parameter
   */
  // originate<TWallet extends DefaultWalletType = DefaultWalletType>(
  //   params: WalletOriginateParams<ContractStorageType<TWallet>>
  // ): { send: () => Promise<OriginationWalletOperation<TWallet>> } {
  //   return this.walletCommand(async () => {
  //     const mappedParams = await this.walletProvider.mapOriginateParamsToWalletParams(() =>
  //       this.context.parser.prepareCodeOrigination({
  //         ...params as WalletOriginateParams,
  //       })
  //     );
  //     const opHash = await this.walletProvider.sendOperations([mappedParams]);
  //     if (!this.context.proto) {
  //       this.context.proto = (await this.context.rpc.getBlock()).protocol as Protocols;
  //     }
  //     return this.context.operationFactory.createOriginationOperation(opHash) as Promise<OriginationWalletOperation<TWallet>>;
  //   });
  // }

  /**
   *
   * @description Set the delegate for a contract.
   *
   * @returns An operation handle with the result from the rpc node
   *
   * @param delegateParams operation parameter
   */
  setDelegate(params: WalletDelegateParams) {
    if (params.delegate && validateAddress(params.delegate) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid address error: ${params.delegate}`);
    }
    return this.walletCommand(async () => {
      const mappedParams = await this.walletProvider.mapDelegateParamsToWalletParams(
        async () => params
      );
      const opHash = await this.walletProvider.sendOperations([mappedParams]);
      return this.context.operationFactory.createDelegationOperation(opHash);
    });
  }

  /**
   *
   * @description Register the current address as delegate.
   *
   * @returns An operation handle with the result from the rpc node
   *
   */
  registerDelegate() {
    return this.walletCommand(async () => {
      const mappedParams = await this.walletProvider.mapDelegateParamsToWalletParams(async () => {
        const delegate = await this.pkh();
        return { delegate };
      });
      const opHash = await this.walletProvider.sendOperations([mappedParams]);
      return this.context.operationFactory.createDelegationOperation(opHash);
    });
  }

  /**
   *
   * @description Transfer tezos tokens from current address to a specific address or call a smart contract.
   *
   * @returns A wallet command from which we can send the operation to the wallet
   *
   * @param params operation parameter
   */
  transfer(params: WalletTransferParams) {
    if (validateAddress(params.to) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid 'to' address: ${params.to}`);
    }
    return this.walletCommand(async () => {
      const mappedParams = await this.walletProvider.mapTransferParamsToWalletParams(
        async () => params
      );
      const opHash = await this.walletProvider.sendOperations([mappedParams]);
      return this.context.operationFactory.createTransactionOperation(opHash);
    });
  }

  /**
   *
   * @description Create a batch of operation
   *
   * @returns A batch object from which we can add more operation or send a command to the wallet to execute the batch
   *
   * @param params List of operation to initialize the batch with
   */
  batch(params?: Parameters<WalletOperationBatch['with']>[0]) {
    const batch = new WalletOperationBatch(this.walletProvider, this.context);

    if (Array.isArray(params)) {
      batch.with(params);
    }

    return batch;
  }

  /**
   *
   * @description Create an smart contract abstraction for the address specified. Calling entrypoints with the returned
   * smart contract abstraction will leverage the wallet provider to make smart contract calls
   *
   * @param address Smart contract address
   */
  async at<T extends ContractAbstraction<Wallet>>(
    address: string,
    contractAbstractionComposer: (abs: ContractAbstraction<Wallet>, context: Context) => T = (x) =>
      x as any
  ): Promise<T> {
    if (validateContractAddress(address) !== ValidationResult.VALID) {
      throw new InvalidContractAddressError(`Invalid contract address: ${address}`);
    }
    const rpc = this.context.withExtensions().rpc;
    const script = await rpc.getNormalizedScript(address);
    const entrypoints = await rpc.getEntrypoints(address);
    const blockHeader = await this.context.rpc.getBlockHeader();
    const chainId = blockHeader.chain_id;
    const abs = new ContractAbstraction(
      address,
      script,
      this,
      this.context.contract,
      entrypoints,
      chainId,
      rpc
    );
    return contractAbstractionComposer(abs, this.context);
  }
}

type PromiseReturnType<T extends (...args: any) => any> = T extends (...args: any) => Promise<infer R> ? R : any;
export type DefaultContractType = ContractAbstraction<ContractProvider>;
export type ContractStorageType<T extends ContractAbstraction<ContractProvider|Wallet>> = PromiseReturnType<T['storage']>;
export interface ContractProvider extends StorageProvider {
  originate<TContract extends DefaultContractType = DefaultContractType>(contract: OriginateParams<ContractStorageType<TContract>>): Promise<OriginationOperation<TContract>>;
  setDelegate(params: DelegateParams): Promise<DelegateOperation>;
  registerDelegate(params: RegisterDelegateParams): Promise<DelegateOperation>;
  transfer(params: TransferParams): Promise<TransactionOperation>;
  reveal(params: RevealParams): Promise<RevealOperation>;
  at<T extends ContractAbstraction<ContractProvider>>(address: string, contractAbstractionComposer?: (abs: ContractAbstraction<ContractProvider>, context: Context) => T): Promise<T>;
  batch(params?: ParamsWithKind[]): OperationBatch ;
  registerGlobalConstant(params: RegisterGlobalConstantParams): Promise<RegisterGlobalConstantOperation>;
}
interface Content {
  kind: string;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  amount: string;
  destination: string;
  parameters: Params;
  metadata: Metadata;
}
interface Params {
  prim: string;
  args: any[];
}
interface Metadata {
  balance_updates: Balanceupdate[];
  operation_result: Operationresult;
}
interface Bigmapdiff {
  key_hash: string;
  key: Key;
  value: Value;
}
interface Key {
  bytes: string;
}
interface Value {
  prim: string;
  args: any[];
}
interface Operationresult {
  status: string;
  storage: Storage;
  big_map_diff: Bigmapdiff[];
  consumed_gas: string;
  storage_size: string;
  paid_storage_size_diff: string;
  consumed_milligas?: string;
}
interface Balanceupdate {
  kind: string;
  contract?: string;
  change: string;
  category?: string;
  delegate?: string;
  level?: number;
}
export interface RpcTransaction {
  protocol: string;
  chain_id: string;
  hash: string;
  branch: string;
  contents: Content[];
  signature: string;
}
function collapse1(val: Token['val'] | any[], prim: string = PairToken.prim): Token['val'] {
  if (Array.isArray(val)) {
    return collapse1(
      {
        prim: prim,
        args: val,
      },
      prim
    );
  }
  if (val.prim === prim && val.args && val.args.length > 2) {
    return {
      ...val,
      args: [
        val.args?.[0],
        {
          prim: prim,
          args: val.args?.slice(1),
        },
      ],
    };
  }
  return val;
}
function deepEqual(a: Token['val'] | any[], b: Token['val'] | any[]): boolean {
  const ac = collapse1(a);
  const bc = collapse1(b);
  return (
    ac.prim === bc.prim &&
    ((ac.args === undefined && bc.args === undefined) ||
      (ac.args !== undefined &&
        bc.args !== undefined &&
        ac.args.length === bc.args.length &&
        ac.args.every((v, i) => deepEqual(v, bc.args?.[i])))) &&
    ((ac.annots === undefined && bc.annots === undefined) ||
      (ac.annots !== undefined &&
        bc.annots !== undefined &&
        ac.annots.length === bc.annots.length &&
        ac.annots.every((v, i) => v === bc.annots?.[i])))
  );
}
export class Schema {
  private root: Token;

  public [schemaTypeSymbol] = true;

  public static isSchema(obj: any): obj is Schema {
    return obj && obj[schemaTypeSymbol] === true;
  }

  // TODO: Should we deprecate this?
  private bigMap?: BigMapToken;

  static fromRPCResponse(val: { script: ScriptResponse }) {
    const storage: Falsy<MichelsonV1ExpressionExtended> =
      val &&
      val.script &&
      Array.isArray(val.script.code) &&
      (val.script.code.find((x: any) => x.prim === 'storage') as MichelsonV1ExpressionExtended);

    if (!storage || !Array.isArray(storage.args)) {
      throw new Error('Invalid rpc response passed as arguments');
    }

    return new Schema(storage.args[0]);
  }

  private isExpressionExtended(
    val: any
  ): val is Required<Pick<MichelsonV1ExpressionExtended, 'prim' | 'args'>> {
    return 'prim' in val && Array.isArray(val.args);
  }

  constructor(readonly val: MichelsonV1Expression) {
    this.root = createToken(val, 0);

    if (this.root instanceof BigMapToken) {
      this.bigMap = this.root;
    } else if (this.isExpressionExtended(val) && val.prim === 'pair') {
      const exp = val.args[0];
      if (this.isExpressionExtended(exp) && exp.prim === 'big_map') {
        this.bigMap = new BigMapToken(exp, 0, createToken);
      }
    }
  }

  private removeTopLevelAnnotation(obj: any) {
    // PairToken and OrToken can have redundant top level annotation in their storage
    if (this.root instanceof PairToken || this.root instanceof OrToken) {
      if (this.root.hasAnnotations() && typeof obj === 'object' && Object.keys(obj).length === 1) {
        return obj[Object.keys(obj)[0]];
      }
    }

    return obj;
  }

  Execute(val: any, semantics?: Semantic) {
    const storage = this.root.Execute(val, semantics);

    return this.removeTopLevelAnnotation(storage);
  }

  // Typecheck(val: any) {
  //   if (this.root instanceof BigMapToken && Number.isInteger(Number(val))) {
  //     return true;
  //   }
  //   try {
  //     this.root.EncodeObject(val);
  //     return true;
  //   } catch (ex) {
  //     return false;
  //   }
  // }

  ExecuteOnBigMapDiff(diff: any[], semantics?: Semantic) {
    if (!this.bigMap) {
      throw new Error('No big map schema');
    }

    if (!Array.isArray(diff)) {
      throw new Error('Invalid big map diff. It must be an array');
    }

    const eltFormat = diff.map(({ key, value }) => ({ args: [key, value] }));

    return this.bigMap.Execute(eltFormat, semantics);
  }

  ExecuteOnBigMapValue(key: any, semantics?: Semantic) {
    if (!this.bigMap) {
      throw new Error('No big map schema');
    }

    return this.bigMap.ValueSchema.Execute(key, semantics);
  }

  // EncodeBigMapKey(key: BigMapKeyType) {
  //   if (!this.bigMap) {
  //     throw new Error('No big map schema');
  //   }

  //   try {
  //     return this.bigMap.KeySchema.ToBigMapKey(key);
  //   } catch (ex) {
  //     throw new Error('Unable to encode big map key: ' + ex);
  //   }
  // }

  // Encode(_value?: any) {
  //   try {
  //     return this.root.EncodeObject(_value);
  //   } catch (ex) {
  //     if (ex instanceof TokenValidationError) {
  //       throw ex;
  //     }

  //     throw new Error(`Unable to encode storage object. ${ex}`);
  //   }
  // }

  ExtractSchema() {
    return this.removeTopLevelAnnotation(this.root.ExtractSchema());
  }

  generateSchema(): TokenSchema {
    return this.removeTopLevelAnnotation(this.root.generateSchema());
  }

  ComputeState(tx: RpcTransaction[], state: any) {
    if (!this.bigMap) {
      throw new Error('No big map schema');
    }

    const bigMap = tx.reduce((prev, current) => {
      return {
        ...prev,
        ...this.ExecuteOnBigMapDiff(current.contents[0].metadata.operation_result.big_map_diff),
      };
    }, {});

    return {
      ...this.Execute(state),
      [this.bigMap.annot()]: bigMap,
    };
  }
  FindFirstInTopLevelPair<T extends MichelsonV1Expression>(storage: any, valueType: any) {
    return this.findValue(this.root['val'], storage, valueType) as T | undefined;
  }

  private findValue(schema: Token['val'] | any[], storage: any, valueToFind: any): any {
    if (deepEqual(valueToFind, schema)) {
      return storage;
    }
    if (Array.isArray(schema) || schema['prim'] === 'pair') {
      const sch = collapse1(schema);
      const str = collapse1(storage, 'Pair');
      if (sch.args === undefined || str.args === undefined) {
        throw new Error('Tokens have no arguments'); // unlikely
      }
      return (
        this.findValue(sch.args[0], str.args[0], valueToFind) ||
        this.findValue(sch.args[1], str.args[1], valueToFind)
      );
    }
  }
  findToken(tokenToFind: string): Array<Token> {
    const tokens: Array<Token> = [];
    return this.root.findAndReturnTokens(tokenToFind, tokens);
  }
}
export enum ChainIds {
  MAINNET = 'NetXdQprcVkpaWU',
  CARTHAGENET = 'NetXjD3HPJJjmcd',
  DELPHINET = 'NetXm8tYqnMWky1',
  EDONET = 'NetXSgo1ZT2DRUG',
  FLORENCENET = 'NetXxkAx4woPLyu',
  GRANADANET = 'NetXz969SFaFn8k',
  HANGZHOUNET = 'NetXZSsxBpMQeAT',
  ITHACANET = 'NetXbhmtAbMukLc',
  ITHACANET2 = 'NetXnHfVqm9iesp',
}
export enum DefaultLambdaAddresses {
  MAINNET = 'KT1CPuTzwC7h7uLXd5WQmpMFso1HxrLBUtpE',
  CARTHAGENET = 'KT1VAy1o1FGiXYfD3YT7x7k5eF5HSHhmc1u6',
  DELPHINET = 'KT19abMFs3haqyKYwqdLjK9GbtofryZLvpiK',
  EDONET = 'KT1A64nVZDccAHGAsf1ZyVajXZcbiwjV3SnN',
  FLORENCENET = 'KT1KCe3YqGnudsiCWb5twbe2DH5T3EMdLpSE',
  GRANADANET = 'KT1BCun2vsA4GBQvsKAuGD5x873MfW2jsN9z',
  HANGZHOUNET = 'KT1PWtBAr1hjK9M9s9oZNZFbfzPdkkD6PSJR',
  ITHACANET = 'KT1CsEGfRHWeuUQFh9LfVFLVMbm7DFBuHPPU',
  ITHACANET2 = 'KT1H2a5vGkMLFGBPMs6oRRJshCvYeXSBSadn',
}
export class InvalidViewSimulationContext extends Error {
  public name = 'InvalidViewSimulationContext';
  constructor(public info: string) {
    super(`${info} Please configure the context of the view execution in the executeView method.`);
  }
}
export class ContractView {
  constructor(
    private currentContract: ContractAbstraction<ContractProvider | Wallet>,
    private provider: ContractProvider,
    private name: string,
    private chainId: string,
    private callbackParametersSchema: ParameterSchema,
    private parameterSchema: ParameterSchema,
    private args: any[]
  ) {}

  async read(customLambdaAddress?: string) {
    let lambdaAddress;

    // TODO Verify if the 'customLambdaAdress' is a valid originated contract and if not, return an appropriate error message.  
    if (customLambdaAddress) {
      lambdaAddress = customLambdaAddress;
    } else if (this.chainId === ChainIds.GRANADANET) {
      lambdaAddress = DefaultLambdaAddresses.GRANADANET;
    } else if (this.chainId === ChainIds.HANGZHOUNET) {
      lambdaAddress = DefaultLambdaAddresses.HANGZHOUNET;
    } else if (this.chainId === ChainIds.ITHACANET) {
      lambdaAddress = DefaultLambdaAddresses.ITHACANET;
    } else if (this.chainId === ChainIds.ITHACANET2) {
      lambdaAddress = DefaultLambdaAddresses.ITHACANET2;
    } else if (this.chainId === ChainIds.MAINNET) {
      lambdaAddress = DefaultLambdaAddresses.MAINNET;
    } else {
      throw new UndefinedLambdaContractError();
    }

    const lambdaContract = await this.provider.at(lambdaAddress);
    const arg = this.parameterSchema.Encode(...this.args);
    const lambdaView = new LambdaView(lambdaContract, this.currentContract, this.name, arg);
    const failedWith = await lambdaView.execute();
    const response = this.callbackParametersSchema.Execute(failedWith);
    return response;
  }
}
export type Contract = ContractAbstraction<ContractProvider>;
export type WalletContract = ContractAbstraction<Wallet>;
export default class LambdaView {
  public readonly voidLambda: object;

  constructor(
    private lambdaContract: Contract | WalletContract,
    private viewContract: ContractAbstraction<ContractProvider | Wallet>,
    public readonly viewMethod: string = 'default',
    private contractParameter: MichelsonV1Expression = { prim: 'Unit' }
  ) {
    this.voidLambda = this.createVoidLambda();
  }

  async execute(): Promise<any> {
    try {
      await this.lambdaContract.methods.default(this.voidLambda).send();
    } catch (ex) {
      if (ex instanceof TezosOperationError) {
        const lastError: any = ex.errors[ex.errors.length - 1];

        const failedWith = lastError.with;
        return failedWith;
      } else {
        throw ex;
      }
    }
  }

  private createVoidLambda(): object {
    const [parameter, callback] = this.getView();

    let contractArgs: MichelsonV1Expression[] = [
      {
        prim: 'pair',
        args: [parameter, { prim: 'contract', args: [callback] }],
      },
    ];

    if (this.viewMethod === 'default') {
      contractArgs = ([{ string: '%default' }] as MichelsonV1Expression[]).concat(contractArgs);
    }

    return [
      { prim: 'PUSH', args: [{ prim: 'mutez' }, { int: '0' }] },
      { prim: 'NONE', args: [{ prim: 'key_hash' }] },
      {
        prim: 'CREATE_CONTRACT',
        args: [
          [
            { prim: 'parameter', args: [callback] },
            { prim: 'storage', args: [{ prim: 'unit' }] },
            {
              prim: 'code',
              args: [[{ prim: 'CAR' }, { prim: 'FAILWITH' }]],
            },
          ],
        ],
      },
      {
        prim: 'DIP',
        args: [
          [
            {
              prim: 'DIP',
              args: [
                [
                  {
                    prim: 'LAMBDA',
                    args: [
                      {
                        prim: 'pair',
                        args: [{ prim: 'address' }, { prim: 'unit' }],
                      },
                      {
                        prim: 'pair',
                        args: [{ prim: 'list', args: [{ prim: 'operation' }] }, { prim: 'unit' }],
                      },
                      [
                        { prim: 'CAR' },
                        { prim: 'CONTRACT', args: [callback] },
                        {
                          prim: 'IF_NONE',
                          args: [
                            [
                              {
                                prim: 'PUSH',
                                args: [{ prim: 'string' }, { string: `Callback type unmatched` }],
                              },
                              { prim: 'FAILWITH' },
                            ],
                            [],
                          ],
                        },
                        {
                          prim: 'PUSH',
                          args: [parameter, this.contractParameter],
                        },
                        { prim: 'PAIR' },
                        {
                          prim: 'DIP',
                          args: [
                            [
                              {
                                prim: 'PUSH',
                                args: [
                                  { prim: 'address' },
                                  { string: `${this.viewContract.address}%${this.viewMethod}` },
                                ],
                              },
                              { prim: 'DUP' },
                              { prim: 'CONTRACT', args: contractArgs },
                              {
                                prim: 'IF_NONE',
                                args: [
                                  [
                                    {
                                      prim: 'PUSH',
                                      args: [
                                        { prim: 'string' },
                                        { string: `Contract does not exist` },
                                      ],
                                    },
                                    { prim: 'FAILWITH' },
                                  ],
                                  [{ prim: 'DIP', args: [[{ prim: 'DROP' }]] }],
                                ],
                              },
                              {
                                prim: 'PUSH',
                                args: [{ prim: 'mutez' }, { int: '0' }],
                              },
                            ],
                          ],
                        },
                        { prim: 'TRANSFER_TOKENS' },
                        {
                          prim: 'DIP',
                          args: [[{ prim: 'NIL', args: [{ prim: 'operation' }] }]],
                        },
                        { prim: 'CONS' },
                        { prim: 'DIP', args: [[{ prim: 'UNIT' }]] },
                        { prim: 'PAIR' },
                      ],
                    ],
                  },
                ],
              ],
            },
            { prim: 'APPLY' },
            {
              prim: 'DIP',
              args: [
                [
                  {
                    prim: 'PUSH',
                    args: [{ prim: 'address' }, { string: this.lambdaContract.address }],
                  },
                  { prim: 'DUP' },
                  {
                    prim: 'CONTRACT',
                    args: [
                      {
                        prim: 'lambda',
                        args: [
                          { prim: 'unit' },
                          {
                            prim: 'pair',
                            args: [
                              { prim: 'list', args: [{ prim: 'operation' }] },
                              { prim: 'unit' },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    prim: 'IF_NONE',
                    args: [
                      [
                        {
                          prim: 'PUSH',
                          args: [{ prim: 'string' }, { string: `Contract does not exists` }],
                        },
                        { prim: 'FAILWITH' },
                      ],
                      [{ prim: 'DIP', args: [[{ prim: 'DROP' }]] }],
                    ],
                  },
                  { prim: 'PUSH', args: [{ prim: 'mutez' }, { int: '0' }] },
                ],
              ],
            },
            { prim: 'TRANSFER_TOKENS' },
            {
              prim: 'DIP',
              args: [[{ prim: 'NIL', args: [{ prim: 'operation' }] }]],
            },
            { prim: 'CONS' },
          ],
        ],
      },
      { prim: 'CONS' },
      { prim: 'DIP', args: [[{ prim: 'UNIT' }]] },
      { prim: 'PAIR' },
    ];
  }

  private getView(): [MichelsonV1Expression, MichelsonV1Expression] {
    const entrypoints = this.viewContract.entrypoints.entrypoints;
    const entrypoint = entrypoints[this.viewMethod] as MichelsonV1Expression;

    if (!entrypoint) {
      throw Error(
        `Contract at ${this.viewContract.address} does not have entrypoint: ${this.viewMethod}`
      );
    }

    if (!('prim' in entrypoint) || !entrypoint.args) {
      // TODO: Enhance this error message to be more descriptive
      throw Error('Entrypoint args undefined');
    }

    const args = Array.from(entrypoint.args) as [MichelsonV1Expression, MichelsonV1Expression];
    const [parameter, callbackContract] = args;
    if ('annots' in parameter) {
      delete parameter['annots'];
    }

    if (!('prim' in callbackContract) || !callbackContract.args) {
      // TODO: Enhance this error message to be more descriptive
      throw Error('Callback contract args undefined');
    }

    let message;
    if (entrypoint.prim !== 'pair') {
      message = `Expected {'prim': 'pair', ..} but found {'prim': ${entrypoint.prim}, ..}`;
    } else if (args.length !== 2) {
      message = `Expected an Array of length 2, but found: ${args}`;
    } else if (callbackContract.prim !== 'contract') {
      message = `Expected a {prim: 'contract', ...}, but found: ${callbackContract.prim}`;
    } else if (callbackContract.args && callbackContract.args.length !== 1) {
      message = `Expected a single argument to 'contract', but found: ${callbackContract.args}`;
    }

    if (message) throw Error(message);

    return [parameter, callbackContract.args[0]] as [MichelsonV1Expression, MichelsonV1Expression];
  }
}
export class InvalidScriptError extends Error {
  name = 'InvalidScriptError';
  constructor(public message: string) {
    super(message);
  }
}
export class ViewEncodingError extends Error {
  name = 'ViewEncodingError';

  constructor(public smartContractViewName: string, public originalError: any) {
    super(`Unable to encode the parameter of the view: ${smartContractViewName}.`);
  }
}
export class ViewSchema {
  readonly viewName: string;
  readonly viewArgsType: MichelsonV1ExpressionExtended;
  readonly viewReturnType: MichelsonV1ExpressionExtended;
  readonly instructions: MichelsonV1ExpressionExtended[];
  private rootArgsType: Token;
  private rootReturnType: Token;

  static fromRPCResponse(val: { script: ScriptResponse }) {
    const allViewSchema: ViewSchema[] = [];

    const views =
      val &&
      val.script &&
      Array.isArray(val.script.code) &&
      (val.script.code.filter((x: any) => x.prim === 'view') as MichelsonV1ExpressionExtended[]);

    if (views) {
      views.forEach((view) => {
        if (!view.args || view.args.length !== 4) {
          throw new InvalidScriptError(
            `Invalid on-chain view found in the script: ${JSON.stringify(view)}`
          );
        }
        allViewSchema.push(new ViewSchema(view.args));
      });
    }
    return allViewSchema;
  }

  constructor(val: MichelsonV1Expression[]) {
    if (val.length !== 4 || !('string' in val[0])) {
      throw new InvalidScriptError(`Invalid on-chain view: ${JSON.stringify(val)}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.viewName = val[0]['string']!;
    this.viewArgsType = val[1] as MichelsonV1ExpressionExtended;
    this.viewReturnType = val[2] as MichelsonV1ExpressionExtended;
    this.instructions = val[3] as MichelsonV1ExpressionExtended[];

    this.rootArgsType = createToken(this.viewArgsType, 0);
    this.rootReturnType = createToken(this.viewReturnType, 0);
  }

  encodeViewArgs(args: any) {
    try {
      return this.rootArgsType.EncodeObject(args);
    } catch (ex) {
      throw new ViewEncodingError(this.viewName, ex);
    }
  }
  decodeViewResult(val: any, semantics?: Semantic) {
    return this.rootReturnType.Execute(val, semantics);
  }
  extractArgsSchema() {
    return this.rootArgsType.ExtractSchema();
  }

  extractResultSchema() {
    return this.rootReturnType.ExtractSchema();
  }
}
export interface ExecutionContextParams {
  source?: string;
  viewCaller: string;
}
const runCodeHelper = (
  viewArgsType: MichelsonV1ExpressionExtended,
  viewReturnType: MichelsonV1ExpressionExtended,
  contractStorageType: MichelsonV1Expression,
  viewInstructions: MichelsonV1ExpressionExtended[],
  viewArgs: MichelsonV1Expression,
  contractStorageValue: MichelsonV1Expression,
  balance: string,
  chain_id: string,
  source?: string,
  amount = '0'
): RPCRunCodeParam => {
  return {
    script: [
      { prim: 'parameter', args: [{ prim: 'pair', args: [viewArgsType, contractStorageType] }] },
      { prim: 'storage', args: [{ prim: 'option', args: [viewReturnType] }] },
      {
        prim: 'code',
        args: [
          [
            { prim: 'CAR' },
            viewInstructions,
            { prim: 'SOME' },
            { prim: 'NIL', args: [{ prim: 'operation' }] },
            { prim: 'PAIR' },
          ],
        ],
      },
    ],
    storage: { prim: 'None' },
    input: { prim: 'Pair', args: [viewArgs, contractStorageValue] },
    amount,
    balance,
    chain_id,
    source,
  };
};
export class InvalidViewParameterError extends Error {
  name = 'Invalid view parameters error';
  cause: any;
  constructor(
    public smartContractViewName: string,
    public sigs: any,
    public args: any,
    public originalError: any
  ) {
    super(
      `Unable to encode the parameter of the view: ${smartContractViewName}. Received ${args} as parameter while expecting one of the following signatures (${JSON.stringify(
        sigs
      )})`
    );
    this.cause = originalError;
  }
}
export class OnChainView {
  constructor(
    private _rpc: RpcClientInterface,
    private _contractAddress: string,
    private _smartContractViewSchema: ViewSchema,
    private _contractStorageType: MichelsonV1Expression,
    private _contractStorageValue: MichelsonV1Expression,
    private _args: any = 'Unit'
  ) {}

  /**
   * @description Get the signature of the smart contract view
   */
  getSignature() {
    return {
      parameter: this._smartContractViewSchema.extractArgsSchema(),
      result: this._smartContractViewSchema.extractResultSchema(),
    };
  }

  /**
   * @description Get the result of the view simulation
   * @param executionContext.source the public key hash of the account who initialized this view execution.
   * @param executionContext.viewCaller the contract address which is the caller of view.
   */
  async executeView(executionContext: ExecutionContextParams) {
    this.verifyContextExecution(executionContext);
    const balance = (await this._rpc.getBalance(this._contractAddress)).toString();
    const chainId = await this._rpc.getChainId();
    return this.executeViewAndDecodeResult(
      runCodeHelper(
        this._smartContractViewSchema.viewArgsType,
        this._smartContractViewSchema.viewReturnType,
        this._contractStorageType,
        this.adaptViewCodeToContext(
          this._smartContractViewSchema.instructions,
          executionContext.viewCaller,
          balance
        ),
        this.transformArgsToMichelson(),
        this._contractStorageValue,
        balance,
        chainId,
        executionContext.source
      )
    );
  }

  private verifyContextExecution(executionContext: ExecutionContextParams) {
    if (
      executionContext.source &&
      validateAddress(executionContext.source) !== ValidationResult.VALID
    ) {
      throw new InvalidViewSimulationContext(
        `The source account who initialized the view execution is invalid: ${executionContext.source}.`
      );
    }
    if (
      !executionContext.viewCaller ||
      validateAddress(executionContext.viewCaller) !== ValidationResult.VALID
    ) {
      throw new InvalidViewSimulationContext(
        `The contract which is the caller of view is invalid: ${executionContext.viewCaller}.`
      );
    }
  }

  private transformArgsToMichelson() {
    try {
      return this._smartContractViewSchema.encodeViewArgs(this._args);
    } catch (error) {
      throw new InvalidViewParameterError(
        this._smartContractViewSchema.viewName,
        this.getSignature(),
        this._args,
        error
      );
    }
  }
  private adaptViewCodeToContext(
    instructions: MichelsonV1ExpressionExtended[],
    viewCaller: string,
    contractBalance: string
  ) {
    const instructionsToReplace = {
      BALANCE: [{ prim: 'PUSH', args: [{ prim: 'mutez' }, { int: contractBalance }] }],
      SENDER: [{ prim: 'PUSH', args: [{ prim: 'address' }, { string: viewCaller }] }],
      SELF_ADDRESS: [
        { prim: 'PUSH', args: [{ prim: 'address' }, { string: this._contractAddress }] },
      ],
      AMOUNT: [{ prim: 'PUSH', args: [{ prim: 'mutez' }, { int: '0' }] }],
    };

    instructions.forEach((inst: any, i: number) => {
      if (inst.prim in instructionsToReplace) {
        instructions[i] = Object(instructionsToReplace)[inst.prim];
      }
      if (inst.args && inst.args.length !== 0) {
        this.adaptViewCodeToContext(inst.args, viewCaller, contractBalance);
      } else if (Array.isArray(inst)) {
        this.adaptViewCodeToContext(inst, viewCaller, contractBalance);
      }
    });
    return instructions;
  }

  private async executeViewAndDecodeResult(viewScript: RPCRunCodeParam) {
    let storage: MichelsonV1ExpressionExtended;
    try {
      storage = (await this._rpc.runCode(viewScript)).storage as MichelsonV1ExpressionExtended;
    } catch (error: any) {
      const failWith = validateAndExtractFailwith(error);
      throw failWith
        ? new ViewSimulationError(
            `The simulation of the on-chain view named ${
              this._smartContractViewSchema.viewName
            } failed with: ${JSON.stringify(failWith)}`,
            this._smartContractViewSchema.viewName,
            failWith,
            error
          )
        : error;
    }
    if (!storage.args) {
      throw new ViewSimulationError(
        `View simulation failed with an invalid result: ${storage}`,
        this._smartContractViewSchema.viewName
      );
    }
    return this._smartContractViewSchema.decodeViewResult(storage.args[0]);
  }
}
export class ViewSimulationError extends Error {
  name = 'ViewSimulationError';
  constructor(
    public message: string,
    public viewName: string,
    public failWith?: MichelsonV1Expression,
    public originalError?: any
  ) {
    super(message);
  }
}
export const validateAndExtractFailwith = (
  error: HttpResponseError
): MichelsonV1Expression | undefined => {
  if (isJsonString(error.body)) {
    const parsedError = JSON.parse(error.body);
    if (Array.isArray(parsedError) && 'with' in parsedError[parsedError.length - 1]) {
      return parsedError[parsedError.length - 1].with;
    }
  }
};
const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};
export class ContractMethodFactory<T extends ContractProvider | Wallet> {
  constructor(private provider: T, private contractAddress: string) {}

  createContractMethodFlatParams(
    smartContractMethodSchema: ParameterSchema,
    smartContractMethodName: string,
    args: any[],
    isMultipleEntrypoint = true,
    isAnonymous = false
  ) {
    return new ContractMethod<T>(
      this.provider,
      this.contractAddress,
      smartContractMethodSchema,
      smartContractMethodName,
      args,
      isMultipleEntrypoint,
      isAnonymous
    );
  }

  createContractMethodObjectParam(
    smartContractMethodSchema: ParameterSchema,
    smartContractMethodName: string,
    args: any[],
    isMultipleEntrypoint = true,
    isAnonymous = false
  ) {
    return new ContractMethodObject<T>(
      this.provider,
      this.contractAddress,
      smartContractMethodSchema,
      smartContractMethodName,
      args,
      isMultipleEntrypoint,
      isAnonymous
    );
  }

  createContractViewObjectParam(
    rpc: RpcClientInterface,
    smartContractViewSchema: ViewSchema,
    contractStorageType: MichelsonV1Expression,
    contractStorageValue: MichelsonV1Expression,
    viewArgs: any
  ) {
    return new OnChainView(
      rpc,
      this.contractAddress,
      smartContractViewSchema,
      contractStorageType,
      contractStorageValue,
      viewArgs
    );
  }
}
export class UndefinedLambdaContractError extends Error {
  name = 'Undefined LambdaContract error';
  constructor() {
    super(
      'This might happen if you are using a sandbox. Please provide the address of a lambda contract as a parameter of the read method.'
    );
  }
}
const isView = (entrypoint: MichelsonV1Expression): boolean => {
  let isView = false;
  if ('prim' in entrypoint && entrypoint.prim === 'pair' && entrypoint.args) {
    const lastElement = entrypoint.args[entrypoint.args.length - 1];
    if ('prim' in lastElement && lastElement.prim === 'contract') {
      isView = true;
    }
  }
  return isView;
};
type DefaultMethods<T extends ContractProvider | Wallet> = Record<string, (...args: any[]) => ContractMethod<T>>;
type DefaultMethodsObject<T extends ContractProvider | Wallet> = Record<string, (args?: any) => ContractMethodObject<T>>;
type DefaultViews = Record<string, (...args: any[]) => ContractView>;
type DefaultContractViews = Record<string, (args?: any) => OnChainView>;
type DefaultStorage = unknown;
const validateArgs = (args: any[], schema: ParameterSchema, name: string) => {
  const sigs = schema.ExtractSignatures();

  if (!sigs.find((x: any[]) => x.length === args.length)) {
    throw new InvalidParameterError(name, sigs, args);
  }
};
const isContractProvider = (variableToCheck: any): variableToCheck is ContractProvider =>
  variableToCheck.contractProviderTypeSymbol !== undefined;
export class ContractAbstraction<T extends ContractProvider | Wallet,
  TMethods extends DefaultMethods<T> = DefaultMethods<T>,
  TMethodsObject extends DefaultMethodsObject<T> = DefaultMethodsObject<T>,
  TViews extends DefaultViews = DefaultViews,
  TContractViews extends DefaultContractViews = DefaultContractViews,
  TStorage extends DefaultStorage = DefaultStorage
> {
  private contractMethodFactory: ContractMethodFactory<T>;
  public methods: TMethods = {} as TMethods;
  public methodsObject: TMethodsObject = {} as TMethodsObject;
  public views: TViews = {} as TViews;
  public contractViews: TContractViews = {} as TContractViews;

  public readonly schema: Schema;

  public readonly parameterSchema: ParameterSchema;
  public readonly viewSchema: ViewSchema[];

  constructor(
    public readonly address: string,
    public readonly script: ScriptResponse,
    provider: T,
    private storageProvider: StorageProvider,
    public readonly entrypoints: EntrypointsResponse,
    private chainId: string,
    rpc: RpcClientInterface
  ) {
    this.contractMethodFactory = new ContractMethodFactory(provider, address);
    this.schema = Schema.fromRPCResponse({ script: this.script });
    this.parameterSchema = ParameterSchema.fromRPCResponse({ script: this.script });

    this.viewSchema = ViewSchema.fromRPCResponse({ script: this.script });
    if (this.viewSchema.length !== 0) {
      this._initializeOnChainViews(this, rpc, this.viewSchema);
    }
    this._initializeMethods(this, provider, this.entrypoints.entrypoints, this.chainId);
  }

  private _initializeMethods(
    currentContract: ContractAbstraction<T>,
    provider: T,
    entrypoints: {
      [key: string]: object;
    },
    chainId: string
  ) {
    const parameterSchema = this.parameterSchema;
    const keys = Object.keys(entrypoints);
    if (parameterSchema.isMultipleEntryPoint) {
      keys.forEach((smartContractMethodName) => {
        const smartContractMethodSchema = new ParameterSchema(entrypoints[smartContractMethodName]);

        (this.methods as DefaultMethods<T>)[smartContractMethodName] = function (...args: any[]) {
          return currentContract.contractMethodFactory.createContractMethodFlatParams(
            smartContractMethodSchema,
            smartContractMethodName,
            args
          );
        };

        (this.methodsObject as DefaultMethodsObject<T>)[smartContractMethodName] = function (args: any) {
          return currentContract.contractMethodFactory.createContractMethodObjectParam(
            smartContractMethodSchema,
            smartContractMethodName,
            args
          );
        };

        if (isContractProvider(provider)) {
          if (isView(entrypoints[smartContractMethodName])) {
            const view = function (...args: any[]) {
              const entrypointParamWithoutCallback = (entrypoints[smartContractMethodName] as any)
                .args[0];
              const smartContractMethodSchemaWithoutCallback = new ParameterSchema(
                entrypointParamWithoutCallback
              );
              const parametersCallback = (entrypoints[smartContractMethodName] as any).args[1]
                .args[0];
              const smartContractMethodCallbackSchema = new ParameterSchema(parametersCallback);

              validateArgs(args, smartContractMethodSchemaWithoutCallback, smartContractMethodName);
              return new ContractView(
                currentContract,
                provider,
                smartContractMethodName,
                chainId,
                smartContractMethodCallbackSchema,
                smartContractMethodSchemaWithoutCallback,
                args
              );
            };
            (this.views as DefaultViews)[smartContractMethodName] = view;
          }
        }
      });

      const anonymousMethods = Object.keys(parameterSchema.ExtractSchema()).filter(
        (key) => Object.keys(entrypoints).indexOf(key) === -1
      );

      anonymousMethods.forEach((smartContractMethodName) => {
        (this.methods as DefaultMethods<T>)[smartContractMethodName] = function (...args: any[]) {
          return currentContract.contractMethodFactory.createContractMethodFlatParams(
            parameterSchema,
            smartContractMethodName,
            args,
            false,
            true
          );
        };

        (this.methodsObject as DefaultMethodsObject<T>)[smartContractMethodName] = function (args: any) {
          return currentContract.contractMethodFactory.createContractMethodObjectParam(
            parameterSchema,
            smartContractMethodName,
            args,
            false,
            true
          );
        };
      });
    } else {
      const smartContractMethodSchema = this.parameterSchema;
      (this.methods as DefaultMethods<T>)[DEFAULT_SMART_CONTRACT_METHOD_NAME] = function (...args: any[]) {
        return currentContract.contractMethodFactory.createContractMethodFlatParams(
          smartContractMethodSchema,
          DEFAULT_SMART_CONTRACT_METHOD_NAME,
          args,
          false
        );
      };

      (this.methodsObject as DefaultMethodsObject<T>)[DEFAULT_SMART_CONTRACT_METHOD_NAME] = function (args: any) {
        return currentContract.contractMethodFactory.createContractMethodObjectParam(
          smartContractMethodSchema,
          DEFAULT_SMART_CONTRACT_METHOD_NAME,
          args,
          false
        );
      };
    }
  }

  private _initializeOnChainViews(
    currentContract: ContractAbstraction<T>,
    rpc: RpcClientInterface,
    allContractViews: ViewSchema[]
  ) {
    const storageType = this.schema.val;
    const storageValue = this.script.storage;

    allContractViews.forEach((viewSchema) => {
      (this.contractViews as DefaultContractViews)[viewSchema.viewName] = function (args: any) {
        return currentContract.contractMethodFactory.createContractViewObjectParam(
          rpc,
          viewSchema,
          storageType,
          storageValue,
          args
        );
      };
    });
  }

  public storage<T extends TStorage = TStorage>() {
    return this.storageProvider.getStorage<T>(this.address, this.schema);
  }

  public bigMap(key: string) {
    return this.storageProvider.getBigMapKey(this.address, key, this.schema);
  }
}

export type DefaultWalletType = ContractAbstraction<Wallet>;
export const findWithKind = <T extends { kind: OpKind }, K extends OpKind>(
  arr: T[],
  kind: K
): (T & { kind: K }) | undefined => {
  if (Array.isArray(arr)) {
    const found = arr.find(op => op.kind === kind);

    if (found && isKind(found, kind)) {
      return found;
    }
  }
};
export const isKind = <T extends { kind: OpKind }, K extends OpKind>(
  op: T,
  kind: K
): op is withKind<T, K> => {
  return op.kind === kind;
};

export class OriginationWalletOperation<TWallet extends DefaultWalletType = DefaultWalletType> extends WalletOperation {
  constructor(
    public readonly opHash: string,
    protected readonly context: Context,
    newHead$: Observable<BlockResponse>
  ) {
    super(opHash, context, newHead$);
  }

  public async originationOperation() {
    const operationResult = await this.operationResults();
    return findWithKind(operationResult, OpKind.ORIGINATION) as
      | OperationContentsAndResultOrigination
      | undefined;
  }

  public async revealOperation() {
    const operationResult = await this.operationResults();
    return findWithKind(operationResult, OpKind.REVEAL) as
      | OperationContentsAndResultReveal
      | undefined;
  }

  public async status(): Promise<OperationStatus> {
    if (!this._included) {
      return 'pending';
    }

    const op = await this.originationOperation();
    if (!op) {
      return 'unknown';
    }

    return op.metadata.operation_result.status;
  }

  public async contract() {
    const op = await this.originationOperation();
    const address = (op?.metadata.operation_result.originated_contracts || [])[0];
    return this.context.wallet.at<TWallet>(address);
  }
}

export interface Packer {
  packData(data: PackDataParams): Promise<PackDataResponse>
}
export type HexString = string;
export interface PackDataResponse {
  packed: HexString;
  gas?: BigNumber | 'unaccounted';
}
export type GlobalConstantHash = string; 
export interface GlobalConstantsProvider {

    /**
     *
     * @description Retrieve the Michelson value of a global constant based on its hash
     *
     * @param hash a string representing the global constant hash
     */
    getGlobalConstantByHash(hash: GlobalConstantHash): Promise<Expr>;
}
export interface TzProvider {
  getBalance(address: string): Promise<BigNumber>;
  getDelegate(address: string): Promise<string | null>;

  activate(pkh: string, secret: string): Promise<Operation>;
}
export class RpcTzProvider extends OperationEmitter implements TzProvider {
  constructor(context: Context) {
    super(context);
  }

  async getBalance(address: string): Promise<BigNumber> {
    if (validateAddress(address) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid address: ${address}`);
    }
    return this.rpc.getBalance(address);
  }

  async getDelegate(address: string): Promise<string | null> {
    if (validateAddress(address) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid address: ${address}`);
    }
    return this.rpc.getDelegate(address);
  }

  async activate(pkh: string, secret: string) {
    if (validateKeyHash(pkh) !== ValidationResult.VALID) {
      throw new InvalidKeyHashError(`Invalid Public Key Hash: ${pkh}`);
    }
    const operation: RPCActivateOperation = {
      kind: OpKind.ACTIVATION,
      pkh,
      secret,
    };

    const prepared = await this.prepareOperation({ operation: [operation], source: pkh });
    const forgedBytes = await this.forge(prepared);
    const bytes = `${forgedBytes.opbytes}00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`;
    return new Operation(
      await this.rpc.injectOperation(bytes),
      { ...forgedBytes, opbytes: bytes },
      [],
      this.context.clone()
    );
  }
}
interface Limits {
  fee?: number;
  storageLimit?: number;
  gasLimit?: number;
}
const mergeLimits = (
  userDefinedLimit: Limits,
  defaultLimits: Required<Limits>
): Required<Limits> => {
  return {
    fee: typeof userDefinedLimit.fee === 'undefined' ? defaultLimits.fee : userDefinedLimit.fee,
    gasLimit:
      typeof userDefinedLimit.gasLimit === 'undefined'
        ? defaultLimits.gasLimit
        : userDefinedLimit.gasLimit,
    storageLimit:
      typeof userDefinedLimit.storageLimit === 'undefined'
        ? defaultLimits.storageLimit
        : userDefinedLimit.storageLimit,
  };
};
const SIGNATURE_STUB =
  'edsigtkpiSSschcaCt9pUVrpNPf7TTcgvgDEDD6NCEHMy8NNQJCGnMfLZzYoQj74yLjo9wx6MPVV29CvVzgi7qEcEUok3k7AuMg';
export class RPCEstimateProvider extends OperationEmitter implements EstimationProvider {
  private readonly ALLOCATION_STORAGE = 257;
  private readonly ORIGINATION_STORAGE = 257;
  private readonly OP_SIZE_REVEAL = 128;

  // Maximum values defined by the protocol
  private async getAccountLimits(pkh: string, constants: ConstantsResponse, numberOfOps?: number) {
    const balance = await this.rpc.getBalance(pkh);
    const {
      hard_gas_limit_per_operation,
      hard_gas_limit_per_block,
      hard_storage_limit_per_operation,
      cost_per_byte,
    } = constants;
    return {
      fee: 0,
      gasLimit: numberOfOps
        ? Math.floor(
            this.ajustGasForBatchOperation(
              hard_gas_limit_per_block,
              hard_gas_limit_per_operation,
              numberOfOps
            ).toNumber()
          )
        : hard_gas_limit_per_operation.toNumber(),
      storageLimit: Math.floor(
        BigNumber.min(balance.dividedBy(cost_per_byte), hard_storage_limit_per_operation).toNumber()
      ),
    };
  }

  // Fix for Granada where the total gasLimit of a batch can not exceed the hard_gas_limit_per_block.
  // If the total gasLimit of the batch is higher than the hard_gas_limit_per_block,
  // the gasLimit is calculated by dividing the hard_gas_limit_per_block by the number of operation in the batch (numberOfOps).
  // numberOfOps is incremented by 1 for safety in case a reveal operation is needed
  private ajustGasForBatchOperation(
    gasLimitBlock: BigNumber,
    gaslimitOp: BigNumber,
    numberOfOps: number
  ) {
    return BigNumber.min(gaslimitOp, gasLimitBlock.div(numberOfOps + 1));
  }

  private getEstimationPropertiesFromOperationContent(
    content: PreapplyResponse['contents'][0],
    size: number,
    costPerByte: BigNumber
  ): EstimateProperties {
    const operationResults = flattenOperationResult({ contents: [content] });
    let totalGas = 0;
    let totalMilligas = 0;
    let totalStorage = 0;
    operationResults.forEach((result) => {
      totalStorage +=
        'originated_contracts' in result && typeof result.originated_contracts !== 'undefined'
          ? result.originated_contracts.length * this.ORIGINATION_STORAGE
          : 0;
      totalStorage += 'allocated_destination_contract' in result ? this.ALLOCATION_STORAGE : 0;
      totalGas += Number(result.consumed_gas) || 0;
      totalMilligas += Number(result.consumed_milligas) || 0;
      totalStorage +=
        'paid_storage_size_diff' in result ? Number(result.paid_storage_size_diff) || 0 : 0;
      totalStorage +=
        'storage_size' in result && 'global_address' in result
          ? Number(result.storage_size) || 0
          : 0;
    });

    if (totalGas !== 0 && totalMilligas === 0) {
      // This will convert gas to milligas for Carthagenet where result does not contain consumed gas in milligas.
      totalMilligas = totalGas * 1000;
    }

    if (isOpWithFee(content)) {
      return {
        milligasLimit: totalMilligas || 0,
        storageLimit: Number(totalStorage || 0),
        opSize: size,
        minimalFeePerStorageByteMutez: costPerByte.toNumber(),
      };
    } else {
      return {
        milligasLimit: 0,
        storageLimit: 0,
        opSize: size,
        minimalFeePerStorageByteMutez: costPerByte.toNumber(),
        baseFeeMutez: 0,
      };
    }
  }

  private async prepareEstimate(params: PrepareOperationParams, constants: ConstantsResponse) {
    const prepared = await this.prepareOperation(params);
    const {
      opbytes,
      opOb: { branch, contents },
    } = await this.forge(prepared);
    const operation: RPCRunOperationParam = {
      operation: { branch, contents, signature: SIGNATURE_STUB },
      chain_id: await this.rpc.getChainId(),
    };

    const { opResponse } = await this.simulate(operation);
    const { cost_per_byte } = constants;
    const errors = [...flattenErrors(opResponse, 'backtracked'), ...flattenErrors(opResponse)];

    // Fail early in case of errors
    if (errors.length) {
      throw new TezosOperationError(errors);
    }

    let numberOfOps = 1;
    if (Array.isArray(params.operation) && params.operation.length > 1) {
      numberOfOps =
        opResponse.contents[0].kind === 'reveal'
          ? params.operation.length - 1
          : params.operation.length;
    }

    return opResponse.contents.map((x) => {
      return this.getEstimationPropertiesFromOperationContent(
        x,
        // TODO: Calculate a specific opSize for each operation.
        x.kind === 'reveal' ? this.OP_SIZE_REVEAL / 2 : opbytes.length / 2 / numberOfOps,
        cost_per_byte
      );
    });
  }

  /**
   *
   * @description Estimate gasLimit, storageLimit and fees for an origination operation
   *
   * @returns An estimation of gasLimit, storageLimit and fees for the operation
   *
   * @param OriginationOperation Originate operation parameter
   */
  async originate({ fee, storageLimit, gasLimit, ...rest }: OriginateParams) {
    const pkh = await this.signer.publicKeyHash();
    const protocolConstants = await this.rpc.getConstants();
    const DEFAULT_PARAMS = await this.getAccountLimits(pkh, protocolConstants);
    const op = await createOriginationOperation(
      await this.context.parser.prepareCodeOrigination({
        ...rest,
        ...mergeLimits({ fee, storageLimit, gasLimit }, DEFAULT_PARAMS),
      })
    );
    const isRevealNeeded = await this.isRevealOpNeeded([op], pkh);
    const ops = isRevealNeeded ? await this.addRevealOp([op], pkh) : op;
    const estimateProperties = await this.prepareEstimate(
      { operation: ops, source: pkh },
      protocolConstants
    );
    if (isRevealNeeded) {
      estimateProperties.shift();
    }
    return Estimate.createEstimateInstanceFromProperties(estimateProperties);
  }
  /**
   *
   * @description Estimate gasLimit, storageLimit and fees for an transfer operation
   *
   * @returns An estimation of gasLimit, storageLimit and fees for the operation
   *
   * @param TransferOperation Originate operation parameter
   */
  async transfer({ fee, storageLimit, gasLimit, ...rest }: TransferParams) {
    if (validateAddress(rest.to) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid 'to' address: ${rest.to}`);
    }
    if (rest.source && validateAddress(rest.source) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid 'source' address: ${rest.source}`);
    }
    const pkh = await this.signer.publicKeyHash();
    const protocolConstants = await this.rpc.getConstants();
    const DEFAULT_PARAMS = await this.getAccountLimits(pkh, protocolConstants);
    const op = await createTransferOperation({
      ...rest,
      ...mergeLimits({ fee, storageLimit, gasLimit }, DEFAULT_PARAMS),
    });
    const isRevealNeeded = await this.isRevealOpNeeded([op], pkh);
    const ops = isRevealNeeded ? await this.addRevealOp([op], pkh) : op;
    const estimateProperties = await this.prepareEstimate(
      { operation: ops, source: pkh },
      protocolConstants
    );
    if (isRevealNeeded) {
      estimateProperties.shift();
    }
    return Estimate.createEstimateInstanceFromProperties(estimateProperties);
  }

  /**
   *
   * @description Estimate gasLimit, storageLimit and fees for a delegate operation
   *
   * @returns An estimation of gasLimit, storageLimit and fees for the operation
   *
   * @param Estimate
   */
  async setDelegate({ fee, gasLimit, storageLimit, ...rest }: DelegateParams) {
    if (rest.source && validateAddress(rest.source) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid source address: ${rest.source}`);
    }
    if (rest.delegate && validateAddress(rest.delegate) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid delegate address: ${rest.delegate}`);
    }

    const pkh = await this.signer.publicKeyHash();
    const sourceOrDefault = rest.source || pkh;
    const protocolConstants = await this.rpc.getConstants();
    const DEFAULT_PARAMS = await this.getAccountLimits(sourceOrDefault, protocolConstants);
    const op = await createSetDelegateOperation({
      ...rest,
      ...mergeLimits({ fee, storageLimit, gasLimit }, DEFAULT_PARAMS),
    });
    const isRevealNeeded = await this.isRevealOpNeeded([op], pkh);
    const ops = isRevealNeeded ? await this.addRevealOp([op], pkh) : op;
    const estimateProperties = await this.prepareEstimate(
      { operation: ops, source: pkh },
      protocolConstants
    );
    if (isRevealNeeded) {
      estimateProperties.shift();
    }
    return Estimate.createEstimateInstanceFromProperties(estimateProperties);
  }

  /**
   *
   * @description Estimate gasLimit, storageLimit and fees for a each operation in the batch
   *
   * @returns An array of Estimate objects. If a reveal operation is needed, the first element of the array is the Estimate for the reveal operation.
   */
  async batch(params: ParamsWithKind[]) {
    const pkh = await this.signer.publicKeyHash();
    let operations: RPCOperation[] = [];
    const protocolConstants = await this.rpc.getConstants();
    const DEFAULT_PARAMS = await this.getAccountLimits(pkh, protocolConstants, params.length);
    for (const param of params) {
      switch (param.kind) {
        case OpKind.TRANSACTION:
          operations.push(
            await createTransferOperation({
              ...param,
              ...mergeLimits(param, DEFAULT_PARAMS),
            })
          );
          break;
        case OpKind.ORIGINATION:
          operations.push(
            await createOriginationOperation(
              await this.context.parser.prepareCodeOrigination({
                ...param,
                ...mergeLimits(param, DEFAULT_PARAMS),
              })
            )
          );
          break;
        case OpKind.DELEGATION:
          operations.push(
            await createSetDelegateOperation({
              ...param,
              ...mergeLimits(param, DEFAULT_PARAMS),
            })
          );
          break;
        case OpKind.ACTIVATION:
          operations.push({
            ...param,
            ...DEFAULT_PARAMS,
          });
          break;
        case OpKind.REGISTER_GLOBAL_CONSTANT:
          operations.push(
            await createRegisterGlobalConstantOperation({
              ...param,
              ...mergeLimits(param, DEFAULT_PARAMS),
            })
          );
          break;
        default:
          throw new Error(`Unsupported operation kind: ${(param as any).kind}`);
      }
    }
    const isRevealNeeded = await this.isRevealOpNeeded(operations, pkh);
    operations = isRevealNeeded ? await this.addRevealOp(operations, pkh) : operations;
    const estimateProperties = await this.prepareEstimate(
      { operation: operations, source: pkh },
      protocolConstants
    );

    return Estimate.createArrayEstimateInstancesFromProperties(estimateProperties);
  }

  /**
   *
   * @description Estimate gasLimit, storageLimit and fees for a delegate operation
   *
   * @returns An estimation of gasLimit, storageLimit and fees for the operation
   *
   * @param Estimate
   */
  async registerDelegate(params: RegisterDelegateParams) {
    const pkh = await this.signer.publicKeyHash();
    const protocolConstants = await this.rpc.getConstants();
    const DEFAULT_PARAMS = await this.getAccountLimits(pkh, protocolConstants);
    const op = await createRegisterDelegateOperation({ ...params, ...DEFAULT_PARAMS }, pkh);
    const isRevealNeeded = await this.isRevealOpNeeded([op], pkh);
    const ops = isRevealNeeded ? await this.addRevealOp([op], pkh) : op;
    const estimateProperties = await this.prepareEstimate(
      { operation: ops, source: pkh },
      protocolConstants
    );
    if (isRevealNeeded) {
      estimateProperties.shift();
    }
    return Estimate.createEstimateInstanceFromProperties(estimateProperties);
  }

  /**
   *
   * @description Estimate gasLimit, storageLimit and fees to reveal the current account
   *
   * @returns An estimation of gasLimit, storageLimit and fees for the operation or undefined if the account is already revealed
   *
   * @param Estimate
   */
  async reveal(params?: RevealParams) {
    const pkh = await this.signer.publicKeyHash();
    if (await this.isAccountRevealRequired(pkh)) {
      const protocolConstants = await this.rpc.getConstants();
      const DEFAULT_PARAMS = await this.getAccountLimits(pkh, protocolConstants);
      const op = await createRevealOperation(
        {
          ...params,
          ...DEFAULT_PARAMS,
        },
        pkh,
        await this.signer.publicKey()
      );
      const estimateProperties = await this.prepareEstimate(
        { operation: op, source: pkh },
        protocolConstants
      );
      return Estimate.createEstimateInstanceFromProperties(estimateProperties);
    }
  }

  /**
   *
   * @description Estimate gasLimit, storageLimit and fees for an registerGlobalConstant operation
   *
   * @returns An estimation of gasLimit, storageLimit and fees for the operation
   *
   * @param params registerGlobalConstant operation parameter
   */
  async registerGlobalConstant({
    fee,
    storageLimit,
    gasLimit,
    ...rest
  }: RegisterGlobalConstantParams) {
    const pkh = await this.signer.publicKeyHash();
    const protocolConstants = await this.rpc.getConstants();
    const DEFAULT_PARAMS = await this.getAccountLimits(pkh, protocolConstants);
    const op = await createRegisterGlobalConstantOperation({
      ...rest,
      ...mergeLimits({ fee, storageLimit, gasLimit }, DEFAULT_PARAMS),
    });
    const isRevealNeeded = await this.isRevealOpNeeded([op], pkh);
    const ops = isRevealNeeded ? await this.addRevealOp([op], pkh) : op;
    const estimateProperties = await this.prepareEstimate(
      { operation: ops, source: pkh },
      protocolConstants
    );
    if (isRevealNeeded) {
      estimateProperties.shift();
    }
    return Estimate.createEstimateInstanceFromProperties(estimateProperties);
  }

  private async addRevealOp(op: RPCOperation[], pkh: string) {
    op.unshift(
      await createRevealOperation(
        {
          ...{
            fee: DEFAULT_FEE.REVEAL,
            gasLimit: DEFAULT_GAS_LIMIT.REVEAL,
            storageLimit: DEFAULT_STORAGE_LIMIT.REVEAL,
          },
        },
        pkh,
        await this.signer.publicKey()
      )
    );
    return op;
  }
}
export class RPCBatchProvider {
  constructor(private context: Context, private estimator: EstimationProvider) { }
  batch(params?: ParamsWithKind[]) {
    const batch = new OperationBatch(this.context, this.estimator);

    if (Array.isArray(params)) {
      batch.with(params);
    }

    return batch;
  }
}
export interface Signer {
  sign(
    op: string,
    magicByte?: Uint8Array
  ): Promise<{
    bytes: string;
    sig: string;
    prefixSig: string;
    sbytes: string;
  }>;
  publicKey(): Promise<string>;
  publicKeyHash(): Promise<string>;
  secretKey(): Promise<string | undefined>;
}
export class NoopSigner implements Signer {
  async publicKey(): Promise<string> {
    throw new UnconfiguredSignerError();
  }
  async publicKeyHash(): Promise<string> {
    throw new UnconfiguredSignerError();
  }
  async secretKey(): Promise<string> {
    throw new UnconfiguredSignerError();
  }
  async sign(_bytes: string, _watermark?: Uint8Array): Promise<any> {
    throw new UnconfiguredSignerError();
  }
}
export class UnconfiguredSignerError extends Error {
  name = 'UnconfiguredSignerError';

  constructor() {
    super(
      'No signer has been configured. Please configure one by calling setProvider({signer}) on your TezosToolkit instance.'
    );
  }
}
export interface Observer<T> {
    closed?: boolean;
    next: (value: T) => void;
    error: (err: any) => void;
    complete: () => void;
}
export interface SubscriptionLike extends Unsubscribable {
    unsubscribe(): void;
    readonly closed: boolean;
}
export declare type TeardownLogic = Unsubscribable | Function | void;
export declare class Subscription implements SubscriptionLike {
    static EMPTY: Subscription;
    closed: boolean;
    protected _parentOrParents: Subscription | Subscription[];
    private _subscriptions;
    constructor(unsubscribe?: () => void);
    unsubscribe(): void;
    add(teardown: TeardownLogic): Subscription;
    remove(subscription: Subscription): void;
}
export declare class Subscriber<T> extends Subscription implements Observer<T> {
    static create<T>(next?: (x?: T) => void, error?: (e?: any) => void, complete?: () => void): Subscriber<T>;
    protected isStopped: boolean;
    protected destination: PartialObserver<any> | Subscriber<any>;
    constructor(destinationOrNext?: PartialObserver<any> | ((value: T) => void), error?: (e?: any) => void, complete?: () => void);
    next(value?: T): void;
    error(err?: any): void;
    complete(): void;
    unsubscribe(): void;
    protected _next(value: T): void;
    protected _error(err: any): void;
    protected _complete(): void;
    _unsubscribeAndRecycle(): Subscriber<T>;
}
export interface Operator<T, R> {
    call(subscriber: Subscriber<R>, source: any): TeardownLogic;
}
export declare class Subject<T> extends Observable<T> implements SubscriptionLike {
    observers: Observer<T>[];
    closed: boolean;
    isStopped: boolean;
    hasError: boolean;
    thrownError: any;
    constructor();
    static create: Function;
    lift<R>(operator: Operator<T, R>): Observable<R>;
    next(value?: T): void;
    error(err: any): void;
    complete(): void;
    unsubscribe(): void;
    _trySubscribe(subscriber: Subscriber<T>): TeardownLogic;
    _subscribe(subscriber: Subscriber<T>): Subscription;
    asObservable(): Observable<T>;
}
export declare class BehaviorSubject<T> extends Subject<T> {
    private _value;
    constructor(_value: T);
    readonly value: T;
    /** @deprecated This is an internal implementation detail, do not use. */
    _subscribe(subscriber: Subscriber<T>): Subscription;
    getValue(): T;
    next(value: T): void;
}
export interface ConfigStreamer {
  streamerPollingIntervalMilliseconds: number;
  shouldObservableSubscriptionRetry: boolean;
  observableSubscriptionRetryFunction: OperatorFunction<any, any>;
}
export declare function retry<T>(count?: number): MonoTypeOperatorFunction<T>;
export const defaultConfigStreamer: ConfigStreamer = {
  streamerPollingIntervalMilliseconds: 20000,
  shouldObservableSubscriptionRetry: false,
  observableSubscriptionRetryFunction: retry(),
};
export const defaultConfigConfirmation: ConfigConfirmation = {
  defaultConfirmationCount: 1,
  confirmationPollingTimeoutSecond: 180,
};
export interface ConfigConfirmation {
  confirmationPollingIntervalSecond?: number;
  confirmationPollingTimeoutSecond: number;
  defaultConfirmationCount: number;
}
export interface HttpRequestOptions {
  url: string;
  method?: 'GET' | 'POST';
  timeout?: number;
  json?: boolean;
  query?: { [key: string]: any };
  headers?: { [key: string]: string };
  mimeType?: string;
}

const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
const XMLHttpRequestCTOR = isNode ? require('xhr2-cookies').XMLHttpRequest : XMLHttpRequest; // ???????????
const defaultTimeout = 30000;
export class HttpBackend {
  protected serialize(obj?: { [key: string]: any }) {
    if (!obj) {
      return '';
    }

    const str = [];
    for (const p in obj) {
      // eslint-disable-next-line no-prototype-builtins
      if (obj.hasOwnProperty(p) && typeof obj[p] !== 'undefined') {
        const prop = typeof obj[p].toJSON === 'function' ? obj[p].toJSON() : obj[p];
        // query arguments can have no value so we need some way of handling that
        // example https://domain.com/query?all
        if (prop === null) {
          str.push(encodeURIComponent(p));
          continue;
        }
        // another use case is multiple arguments with the same name
        // they are passed as array
        if (Array.isArray(prop)) {
          prop.forEach((item) => {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(item));
          });
          continue;
        }
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(prop));
      }
    }
    const serialized = str.join('&');
    if (serialized) {
      return `?${serialized}`;
    } else {
      return '';
    }
  }

  protected createXHR(): XMLHttpRequest {
    return new XMLHttpRequestCTOR();
  }

  createRequest<T>(
    {
      url,
      method,
      timeout,
      query,
      headers = {},
      json = true,
      mimeType = undefined,
    }: HttpRequestOptions,
    data?: object | string
  ) {
    return new Promise<T>((resolve, reject) => {
      const request = this.createXHR();
      request.open(method || 'GET', `${url}${this.serialize(query)}`);
      if (!headers['Content-Type']) {
        request.setRequestHeader('Content-Type', 'application/json');
      }
      if (mimeType) {
        request.overrideMimeType(`${mimeType}`);
      }
      for (const k in headers) {
        request.setRequestHeader(k, headers[k]);
      }
      request.timeout = timeout || defaultTimeout;
      request.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          if (json) {
            try {
              resolve(JSON.parse(request.response));
            } catch (ex) {
              reject(new Error(`Unable to parse response: ${request.response}`));
            }
          } else {
            resolve(request.response);
          }
        } else {
          reject(
            new HttpResponseError(
              `Http error response: (${this.status}) ${request.response}`,
              this.status as STATUS_CODE,
              request.statusText,
              request.response,
              url
            )
          );
        }
      };

      request.ontimeout = function () {
        reject(new Error(`Request timed out after: ${request.timeout}ms`));
      };

      request.onerror = function (err) {
        reject(new HttpRequestFailed(url, err));
      };

      if (data) {
        const dataStr = JSON.stringify(data);
        request.send(dataStr);
      } else {
        request.send();
      }
    });
  }
}
export class HttpRequestFailed extends Error {
  public name = 'HttpRequestFailed';

  constructor(public url: string, public innerEvent: any) {
    super(`Request to ${url} failed`);
  }
}
export function castToBigNumber(data: any, keys?: any): object {
  const returnArray: boolean = Array.isArray(data);
  if (typeof keys === 'undefined') {
    keys = Object.keys(data);
  }
  const response: any = returnArray ? [] : {};

  keys.forEach((key: any) => {
    const item = data[key];
    let res: any;
    if (typeof item === 'undefined') {
      return;
    }

    if (Array.isArray(item)) {
      res = castToBigNumber(item);
      response[key] = res;
      return;
    }

    res = new BigNumber(item);
    response[key] = res;
  });

  return response;
}
export interface RawBlockHeaderResponse {
  protocol: string;
  chain_id: string;
  hash: string;
  level: number;
  proto: number;
  predecessor: string;
  timestamp: string;
  validation_pass: number;
  operations_hash: string;
  fitness: string[];
  context: string;
  priority: number;
  proof_of_work_nonce: string;
  signature: string;
}
export const defaultChain = 'main';
export const defaultRPCOptions: RPCOptions = { block: 'head' };
export class RpcClient implements RpcClientInterface {
    constructor(
    protected url: string,
    protected chain: string = defaultChain,
    protected httpBackend: HttpBackend = new HttpBackend()
  ) {}

  protected createURL(path: string) {
    // Trim trailing slashes because it is assumed to be included in path
    return `${this.url.replace(/\/+$/g, '')}${path}`;
  }

  private validateAddress(address: string) {
    if (validateAddress(address) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid address: ${address}`);
    }
  }

  private validateContract(address: string) {
    if (validateContractAddress(address) !== ValidationResult.VALID) {
      throw new InvalidAddressError(`Invalid address: ${address}`);
    }
  }
  async getBlockHash({ block }: RPCOptions = defaultRPCOptions): Promise<string> {
    const hash = await this.httpBackend.createRequest<string>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/hash`),
      method: 'GET',
    });
    return hash;
  }
  async getLiveBlocks({ block }: RPCOptions = defaultRPCOptions): Promise<string[]> {
    const blocks = await this.httpBackend.createRequest<string[]>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/live_blocks`),
      method: 'GET',
    });
    return blocks;
  }
  async getBalance(
    address: string,
    { block }: RPCOptions = defaultRPCOptions
  ): Promise<BalanceResponse> {
    this.validateAddress(address);
    const balance = await this.httpBackend.createRequest<BalanceResponse>({
      url: this.createURL(
        `/chains/${this.chain}/blocks/${block}/context/contracts/${address}/balance`
      ),
      method: 'GET',
    });
    return new BigNumber(balance);
  }
  async getStorage(
    address: string,
    { block }: { block: string } = defaultRPCOptions
  ): Promise<StorageResponse> {
    this.validateContract(address);
    return this.httpBackend.createRequest<StorageResponse>({
      url: this.createURL(
        `/chains/${this.chain}/blocks/${block}/context/contracts/${address}/storage`
      ),
      method: 'GET',
    });
  }
  async getScript(
    address: string,
    { block }: { block: string } = defaultRPCOptions
  ): Promise<ScriptResponse> {
    this.validateContract(address);
    return this.httpBackend.createRequest<ScriptResponse>({
      url: this.createURL(
        `/chains/${this.chain}/blocks/${block}/context/contracts/${address}/script`
      ),
      method: 'GET',
    });
  }
  async getNormalizedScript(
    address: string,
    unparsingMode: UnparsingMode = { unparsing_mode: 'Readable' },
    { block }: { block: string } = defaultRPCOptions
  ): Promise<ScriptResponse> {
    this.validateContract(address);
    return this.httpBackend.createRequest<ScriptResponse>(
      {
        url: this.createURL(
          `/chains/${this.chain}/blocks/${block}/context/contracts/${address}/script/normalized`
        ),
        method: 'POST',
      },
      unparsingMode
    );
  }
  async getContract(
    address: string,
    { block }: { block: string } = defaultRPCOptions
  ): Promise<ContractResponse> {
    this.validateAddress(address);
    const contractResponse = await this.httpBackend.createRequest<ContractResponse>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/context/contracts/${address}`),
      method: 'GET',
    });
    return {
      ...contractResponse,
      balance: new BigNumber(contractResponse.balance),
    };
  }
  async getManagerKey(
    address: string,
    { block }: { block: string } = defaultRPCOptions
  ): Promise<ManagerKeyResponse> {
    this.validateAddress(address);
    return this.httpBackend.createRequest<ManagerKeyResponse>({
      url: this.createURL(
        `/chains/${this.chain}/blocks/${block}/context/contracts/${address}/manager_key`
      ),
      method: 'GET',
    });
  }
  async getDelegate(
    address: string,
    { block }: { block: string } = defaultRPCOptions
  ): Promise<DelegateResponse> {
    this.validateAddress(address);
    let delegate: DelegateResponse;
    try {
      delegate = await this.httpBackend.createRequest<DelegateResponse>({
        url: this.createURL(
          `/chains/${this.chain}/blocks/${block}/context/contracts/${address}/delegate`
        ),
        method: 'GET',
      });
    } catch (ex) {
      if (ex instanceof HttpResponseError && ex.status === STATUS_CODE.NOT_FOUND) {
        delegate = null;
      } else {
        throw ex;
      }
    }
    return delegate;
  }
  async getBigMapKey(
    address: string,
    key: BigMapKey,
    { block }: { block: string } = defaultRPCOptions
  ): Promise<BigMapGetResponse> {
    this.validateAddress(address);
    return this.httpBackend.createRequest<BigMapGetResponse>(
      {
        url: this.createURL(
          `/chains/${this.chain}/blocks/${block}/context/contracts/${address}/big_map_get`
        ),
        method: 'POST',
      },
      key
    );
  }
  async getBigMapExpr(
    id: string,
    expr: string,
    { block }: { block: string } = defaultRPCOptions
  ): Promise<BigMapResponse> {
    return this.httpBackend.createRequest<BigMapResponse>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/context/big_maps/${id}/${expr}`),
      method: 'GET',
    });
  }
  async getDelegates(
    address: string,
    { block }: { block: string } = defaultRPCOptions
  ): Promise<DelegatesResponse> {
    this.validateAddress(address);
    const response = await this.httpBackend.createRequest<DelegatesResponse>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/context/delegates/${address}`),
      method: 'GET',
    });

    return {
      deactivated: response.deactivated,
      balance: new BigNumber(response.balance),
      frozen_balance: new BigNumber(response.frozen_balance),
      frozen_balance_by_cycle: response.frozen_balance_by_cycle.map(
        ({ deposit, deposits, fees, rewards, ...rest }) => {
          const castedToBigNumber: any = castToBigNumber({ deposit, deposits, fees, rewards }, [
            'deposit',
            'deposits',
            'fees',
            'rewards',
          ]);
          return {
            ...rest,
            deposit: castedToBigNumber.deposit,
            deposits: castedToBigNumber.deposits,
            fees: castedToBigNumber.fees,
            rewards: castedToBigNumber.rewards,
          };
        }
      ),
      staking_balance: new BigNumber(response.staking_balance),
      delegated_contracts: response.delegated_contracts,
      delegated_balance: new BigNumber(response.delegated_balance),
      grace_period: response.grace_period,
      voting_power: response.voting_power,
    };
  }
  async getConstants({ block }: RPCOptions = defaultRPCOptions): Promise<ConstantsResponse> {
    const response = await this.httpBackend.createRequest<ConstantsResponse>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/context/constants`),
      method: 'GET',
    });

    const castedResponse: any = castToBigNumber(response, [
      'time_between_blocks',
      'hard_gas_limit_per_operation',
      'hard_gas_limit_per_block',
      'proof_of_work_threshold',
      'tokens_per_roll',
      'seed_nonce_revelation_tip',
      'block_security_deposit',
      'endorsement_security_deposit',
      'block_reward',
      'endorsement_reward',
      'cost_per_byte',
      'hard_storage_limit_per_operation',
      'test_chain_duration',
      'baking_reward_per_endorsement',
      'delay_per_missing_endorsement',
      'minimal_block_delay',
      'liquidity_baking_subsidy',
      'cache_layout',
      'baking_reward_fixed_portion',
      'baking_reward_bonus_per_slot',
      'endorsing_reward_per_slot',
      'double_baking_punishment',
      'delay_increment_per_round',
    ]);

    return {
      ...response,
      ...(castedResponse as ConstantsResponse),
    };
  }
  async getBlock({ block }: RPCOptions = defaultRPCOptions): Promise<BlockResponse> {
    const response = await this.httpBackend.createRequest<BlockResponse>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}`),
      method: 'GET',
    });

    return response;
  }
  async getBlockHeader({ block }: RPCOptions = defaultRPCOptions): Promise<BlockHeaderResponse> {
    const response = await this.httpBackend.createRequest<RawBlockHeaderResponse>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/header`),
      method: 'GET',
    });

    return response;
  }
  async getBlockMetadata({ block }: RPCOptions = defaultRPCOptions): Promise<BlockMetadata> {
    const response = await this.httpBackend.createRequest<BlockMetadata>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/metadata`),
      method: 'GET',
    });

    return response;
  }
  async getBakingRights(
    args: BakingRightsQueryArguments = {},
    { block }: RPCOptions = defaultRPCOptions
  ): Promise<BakingRightsResponse> {
    const response = await this.httpBackend.createRequest<BakingRightsResponse>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/helpers/baking_rights`),
      method: 'GET',
      query: args,
    });

    return response;
  }
  async getEndorsingRights(
    args: EndorsingRightsQueryArguments = {},
    { block }: RPCOptions = defaultRPCOptions
  ): Promise<EndorsingRightsResponse> {
    const response = await this.httpBackend.createRequest<EndorsingRightsResponse>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/helpers/endorsing_rights`),
      method: 'GET',
      query: args,
    });

    return response;
  }
  async getBallotList({ block }: RPCOptions = defaultRPCOptions): Promise<BallotListResponse> {
    const response = await this.httpBackend.createRequest<BallotListResponse>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/votes/ballot_list`),
      method: 'GET',
    });

    return response;
  }
  async getBallots({ block }: RPCOptions = defaultRPCOptions): Promise<BallotsResponse> {
    const response = await this.httpBackend.createRequest<BallotsResponse>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/votes/ballots`),
      method: 'GET',
    });

    return response;
  }
  async getCurrentPeriodKind({
    block,
  }: RPCOptions = defaultRPCOptions): Promise<PeriodKindResponse> {
    const response = await this.httpBackend.createRequest<PeriodKindResponse>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/votes/current_period_kind`),
      method: 'GET',
    });

    return response;
  }
  async getCurrentProposal({
    block,
  }: RPCOptions = defaultRPCOptions): Promise<CurrentProposalResponse> {
    const response = await this.httpBackend.createRequest<CurrentProposalResponse>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/votes/current_proposal`),
      method: 'GET',
    });

    return response;
  }
  async getCurrentQuorum({
    block,
  }: RPCOptions = defaultRPCOptions): Promise<CurrentQuorumResponse> {
    const response = await this.httpBackend.createRequest<CurrentQuorumResponse>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/votes/current_quorum`),
      method: 'GET',
    });

    return response;
  }
  async getVotesListings({
    block,
  }: RPCOptions = defaultRPCOptions): Promise<VotesListingsResponse> {
    const response = await this.httpBackend.createRequest<VotesListingsResponse>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/votes/listings`),
      method: 'GET',
    });

    return response;
  }
  async getProposals({ block }: RPCOptions = defaultRPCOptions): Promise<ProposalsResponse> {
    const response = await this.httpBackend.createRequest<ProposalsResponse>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/votes/proposals`),
      method: 'GET',
    });

    return response;
  }
  async forgeOperations(
    data: ForgeOperationsParams,
    { block }: RPCOptions = defaultRPCOptions
  ): Promise<string> {
    return this.httpBackend.createRequest<string>(
      {
        url: this.createURL(`/chains/${this.chain}/blocks/${block}/helpers/forge/operations`),
        method: 'POST',
      },
      data
    );
  }
  async injectOperation(signedOpBytes: string): Promise<OperationHash> {
    return this.httpBackend.createRequest<any>(
      {
        url: this.createURL(`/injection/operation`),
        method: 'POST',
      },
      signedOpBytes
    );
  }
  async preapplyOperations(
    ops: PreapplyParams,
    { block }: RPCOptions = defaultRPCOptions
  ): Promise<PreapplyResponse[]> {
    const response = await this.httpBackend.createRequest<PreapplyResponse[]>(
      {
        url: this.createURL(`/chains/${this.chain}/blocks/${block}/helpers/preapply/operations`),
        method: 'POST',
      },
      ops
    );

    return response;
  }
  async getEntrypoints(
    contract: string,
    { block }: RPCOptions = defaultRPCOptions
  ): Promise<EntrypointsResponse> {
    this.validateContract(contract);
    const contractResponse = await this.httpBackend.createRequest<{
      entrypoints: { [key: string]: MichelsonV1ExpressionExtended };
    }>({
      url: this.createURL(
        `/chains/${this.chain}/blocks/${block}/context/contracts/${contract}/entrypoints`
      ),
      method: 'GET',
    });

    return contractResponse;
  }
  async runOperation(
    op: RPCRunOperationParam,
    { block }: RPCOptions = defaultRPCOptions
  ): Promise<PreapplyResponse> {
    const response = await this.httpBackend.createRequest<any>(
      {
        url: this.createURL(`/chains/${this.chain}/blocks/${block}/helpers/scripts/run_operation`),
        method: 'POST',
      },
      op
    );

    return response;
  }
  async runCode(
    code: RPCRunCodeParam,
    { block }: RPCOptions = defaultRPCOptions
  ): Promise<RunCodeResult> {
    const response = await this.httpBackend.createRequest<any>(
      {
        url: this.createURL(`/chains/${this.chain}/blocks/${block}/helpers/scripts/run_code`),
        method: 'POST',
      },
      code
    );

    return response;
  }

  async getChainId() {
    return this.httpBackend.createRequest<string>({
      url: this.createURL(`/chains/${this.chain}/chain_id`),
      method: 'GET',
    });
  }
  async packData(data: PackDataParams, { block }: RPCOptions = defaultRPCOptions) {
    const { gas, ...rest } = await this.httpBackend.createRequest<PackDataResponse>(
      {
        url: this.createURL(`/chains/${this.chain}/blocks/${block}/helpers/scripts/pack_data`),
        method: 'POST',
      },
      data
    );

    let formattedGas = gas;
    const tryBigNumber = new BigNumber(gas || '');
    if (!tryBigNumber.isNaN()) {
      formattedGas = tryBigNumber;
    }

    return { gas: formattedGas, ...rest };
  }
  getRpcUrl() {
    return this.url;
  }
  async getCurrentPeriod({
    block,
  }: RPCOptions = defaultRPCOptions): Promise<VotingPeriodBlockResult> {
    const response = await this.httpBackend.createRequest<VotingPeriodBlockResult>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/votes/current_period`),
      method: 'GET',
    });

    return response;
  }
  async getSuccessorPeriod({
    block,
  }: RPCOptions = defaultRPCOptions): Promise<VotingPeriodBlockResult> {
    const response = await this.httpBackend.createRequest<VotingPeriodBlockResult>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/votes/successor_period`),
      method: 'GET',
    });

    return response;
  }
  async getSaplingDiffById(
    id: string,
    { block }: { block: string } = defaultRPCOptions
  ): Promise<SaplingDiffResponse> {
    return this.httpBackend.createRequest<SaplingDiffResponse>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/context/sapling/${id}/get_diff`),
      method: 'GET',
    });
  }

  async getSaplingDiffByContract(
    contract: string,
    { block }: { block: string } = defaultRPCOptions
  ): Promise<SaplingDiffResponse> {
    return this.httpBackend.createRequest<SaplingDiffResponse>({
      url: this.createURL(
        `/chains/${this.chain}/blocks/${block}/context/contracts/${contract}/single_sapling_get_diff`
      ),
      method: 'GET',
    });
  }

  async getProtocols({ block }: { block: string } = defaultRPCOptions): Promise<ProtocolsResponse> {
    return this.httpBackend.createRequest<ProtocolsResponse>({
      url: this.createURL(`/chains/${this.chain}/blocks/${block}/protocols`),
      method: 'GET',
    });
  }
}
export class Context {
  private _rpcClient: RpcClientInterface;
  private _forger: Forger;
  private _parser: ParserProvider;
  private _injector: Injector;
  private _walletProvider: WalletProvider;
  public readonly operationFactory: OperationFactory;
  private _packer: Packer;
  private providerDecorator: Array<(context: Context) => Context> = [];
  private _globalConstantsProvider: GlobalConstantsProvider;
  public readonly tz = new RpcTzProvider(this);
  public readonly estimate = new RPCEstimateProvider(this);
  public readonly contract = new RpcContractProvider(this, this.estimate);
  public readonly batch = new RPCBatchProvider(this, this.estimate);
  public readonly wallet = new Wallet(this);

  constructor(
    private _rpc: RpcClientInterface | string,
    private _signer: Signer = new NoopSigner(),
    private _proto?: Protocols,
    public readonly _config = new BehaviorSubject({
      ...defaultConfigStreamer,
      ...defaultConfigConfirmation,
    }),
    forger?: Forger,
    injector?: Injector,
    packer?: Packer,
    wallet?: WalletProvider,
    parser?: ParserProvider,
    globalConstantsProvider?: GlobalConstantsProvider
  ) {
    if (typeof this._rpc === 'string') {
      this._rpcClient = new RpcClient(this._rpc);
    } else {
      this._rpcClient = this._rpc;
    }
    this._forger = forger ? forger : new RpcForger(this);
    this._injector = injector ? injector : new RpcInjector(this);
    this.operationFactory = new OperationFactory(this);
    this._walletProvider = wallet ? wallet : new LegacyWalletProvider(this);
    this._parser = parser ? parser : new MichelCodecParser(this);
    this._packer = packer ? packer : new RpcPacker(this);
    this._globalConstantsProvider = globalConstantsProvider
      ? globalConstantsProvider
      : new NoopGlobalConstantsProvider();
  }

  get config(): ConfigConfirmation & ConfigStreamer {
    return this._config.getValue();
  }

  set config(value: ConfigConfirmation & ConfigStreamer) {
    this._config.next({
      ...value,
    });
  }

  setPartialConfig(value: Partial<ConfigConfirmation> & Partial<ConfigStreamer>) {
    this._config.next({
      ...this._config.getValue(),
      ...value,
    });
  }

  get rpc(): RpcClientInterface {
    return this._rpcClient;
  }

  set rpc(value: RpcClientInterface) {
    this._rpcClient = value;
  }

  get injector() {
    return this._injector;
  }

  set injector(value: Injector) {
    this._injector = value;
  }

  get forger() {
    return this._forger;
  }

  set forger(value: Forger) {
    this._forger = value;
  }

  get signer() {
    return this._signer;
  }

  set signer(value: Signer) {
    this._signer = value;
  }

  get walletProvider() {
    return this._walletProvider;
  }

  set walletProvider(value: WalletProvider) {
    this._walletProvider = value;
  }

  set proto(value: Protocols | undefined) {
    this._proto = value;
  }

  get proto() {
    return this._proto;
  }

  get parser() {
    return this._parser;
  }

  set parser(value: ParserProvider) {
    this._parser = value;
  }

  get packer() {
    return this._packer;
  }

  set packer(value: Packer) {
    this._packer = value;
  }

  get globalConstantsProvider() {
    return this._globalConstantsProvider;
  }

  set globalConstantsProvider(value: GlobalConstantsProvider) {
    this._globalConstantsProvider = value;
  }

  async isAnyProtocolActive(protocol: string[] = []) {
    if (this._proto) {
      return protocol.includes(this._proto);
    } else {
      const { next_protocol } = await this.rpc.getBlockMetadata();
      return protocol.includes(next_protocol);
    }
  }

  async getConfirmationPollingInterval() {
    // Granada will generally halve the time between blocks, from 60 seconds to 30 seconds (mainnet).
    // We reduce the default value in the same proportion, from 10 to 5.
    const defaultInterval = 5;
    try {
      const constants = await this.rpc.getConstants();
      let blockTime = constants.time_between_blocks[0];
      if (constants.minimal_block_delay !== undefined) {
        blockTime = constants.minimal_block_delay;
      }
      let confirmationPollingInterval = BigNumber.sum(
        blockTime,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        new BigNumber(constants.delay_per_missing_endorsement!).multipliedBy(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          Math.max(0, constants.initial_endorsers! - constants.endorsers_per_block)
        )
      );

      // Divide the polling interval by a constant 3
      // to improvise for polling time to work in prod,
      // testnet and sandbox enviornment.
      confirmationPollingInterval = confirmationPollingInterval.dividedBy(3);

      this.config.confirmationPollingIntervalSecond =
        confirmationPollingInterval.toNumber() === 0 ? 0.1 : confirmationPollingInterval.toNumber();
      return this.config.confirmationPollingIntervalSecond;
    } catch (exception) {
      // Return default value if there is
      // an issue returning from constants
      // file.
      return defaultInterval;
    }
  }

  /**
   * @description Create a copy of the current context. Useful when you have long running operation and you do not want a context change to affect the operation
   */
  clone(): Context {
    return new Context(
      this.rpc,
      this.signer,
      this.proto,
      this._config,
      this.forger,
      this._injector,
      this.packer,
      this._walletProvider,
      this._parser,
      this._globalConstantsProvider,
    );
  }

  /**
   * @description Allows extensions set on the TezosToolkit to inject logic into the context
   */
  registerProviderDecorator(fx: (context: Context) => Context) {
    this.providerDecorator.push(fx);
  }

  /**
   * @description Applies the decorators on a cloned instance of the context and returned this cloned instance.
   * The decorators are functions that inject logic into the context.
   * They are provided by the extensions set on the TezosToolkit by calling the registerProviderDecorator method.
   */
  withExtensions = (): Context => {
    let clonedContext = this.clone();
    this.providerDecorator.forEach((decorator) => {
      clonedContext = decorator(clonedContext);
    });

    return clonedContext;
  };
}
export class UnconfiguredGlobalConstantsProviderError extends Error {
  name = 'UnconfiguredGlobalConstantsProviderError';

  constructor() {
    super(
      'No global constants provider has been configured. Please configure one by calling setGlobalConstantsProvider({globalConstantsProvider}) on your TezosToolkit instance.'
    );
  }
}
export class RpcPacker implements Packer {
  constructor(private context: Context) {}
  
  async packData(data: PackDataParams): Promise<PackDataResponse> {
    return this.context.rpc.packData(data);
  }
}
export class NoopGlobalConstantsProvider implements GlobalConstantsProvider {
    async getGlobalConstantByHash(_hash: GlobalConstantHash): Promise<Expr> {
        throw new UnconfiguredGlobalConstantsProviderError();
    }
}
export const attachKind = <T, K extends OpKind>(op: T, kind: K) => {
  return { ...op, kind } as withKind<T, K>;
};
export class LegacyWalletProvider implements WalletProvider {
  constructor(private context: Context) {}

  async getPKH(): Promise<string> {
    return this.context.signer.publicKeyHash();
  }

  async mapTransferParamsToWalletParams(params: () => Promise<WalletTransferParams>) {
    return attachKind(await params(), OpKind.TRANSACTION);
  }

  async mapOriginateParamsToWalletParams(params: () => Promise<WalletOriginateParams>) {
    return attachKind(await params(), OpKind.ORIGINATION);
  }

  async mapDelegateParamsToWalletParams(params: () => Promise<WalletDelegateParams>) {
    return attachKind(await params(), OpKind.DELEGATION);
  }

  async sendOperations(params: WalletParamsWithKind[]) {
    const op = await this.context.batch.batch(params as any).send();
    return op.hash;
  }
}
export class RpcForger implements Forger {
  constructor(private context: Context) {}

  forge({ branch, contents }: ForgeParams): Promise<ForgeResponse> {
    return this.context.rpc.forgeOperations({ branch, contents });
  }
}
export class RpcInjector implements Injector {
  constructor(private context: Context) {}
  inject(signedOperationBytes: string): Promise<string> {
    return this.context.rpc.injectOperation(signedOperationBytes);
  }
}
export enum Protocol {
  Ps9mPmXa = 'Ps9mPmXaRzmzk35gbAYNCAw6UXdE2qoABTHbN2oEEc1qM7CwT9P',
  PtCJ7pwo = 'PtCJ7pwoxe8JasnHY8YonnLYjcVHmhiARPJvqcC6VfHT5s8k8sY',
  PsYLVpVv = 'PsYLVpVvgbLhAhoqAkMFUo6gudkJ9weNXhUYCiLDzcUpFpkk8Wt',
  PsddFKi3 = 'PsddFKi32cMJ2qPjf43Qv5GDWLDPZb3T3bF6fLKiF5HtvHNU7aP',
  Pt24m4xi = 'Pt24m4xiPbLDhVgVfABUjirbmda3yohdN82Sp9FeuAXJ4eV9otd',
  PsBABY5H = 'PsBABY5HQTSkA4297zNHfsZNKtxULfL18y95qb3m53QJiXGmrbU',
  PsBabyM1 = 'PsBabyM1eUXZseaJdmXFApDSBqj8YBfwELoxZHHW77EMcAbbwAS',
  PsCARTHA = 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
  PsDELPH1 = 'PsDELPH1Kxsxt8f9eWbxQeRxkjfbxoqM52jvs5Y5fBxWWh4ifpo',
  PtEdoTez = 'PtEdoTezd3RHSC31mpxxo1npxFjoWWcFgQtxapi51Z8TLu6v6Uq',
  PtEdo2Zk = 'PtEdo2ZkT9oKpimTah6x2embF25oss54njMuPzkJTEi5RqfdZFA',
  PsFLoren = 'PsFLorenaUUuikDWvMDr6fGBRG8kt3e3D3fHoXK1j1BFRxeSH4i',
  PsFLorena = 'PsFLorenaUUuikDWvMDr6fGBRG8kt3e3D3fHoXK1j1BFRxeSH4i',
  PtGRANAD = 'PtGRANADsDU8R9daYKAgWnQYAJ64omN1o3KMGVCykShA97vQbvV',
  PtGRANADs = 'PtGRANADsDU8R9daYKAgWnQYAJ64omN1o3KMGVCykShA97vQbvV',
  PtHangzH = 'PtHangzHogokSuiMHemCuowEavgYTP8J5qQ9fQS793MHYFpCY3r',
  PtHangz2 = 'PtHangz2aRngywmSRGGvrcTyMbbdpWdpFKuS4uMWxg2RaH9i1qx',
  PsiThaCa = 'PsiThaCaT47Zboaw71QWScM8sXeMM7bbQFncK9FLqYc6EKdpjVP',
  Psithaca2 = 'Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A',
  ProtoALpha = 'ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK',
}
export type ProtocolID = `${Protocol}`;
export interface ProtocolOptions {
  protocol?: ProtocolID;
}
export interface ParserOptions extends ProtocolOptions {
  expandMacros?: boolean;
  expandGlobalConstant?: GlobalConstantHashAndValue;
}
export interface GlobalConstantHashAndValue {
  [globalConstantHash: string]: Expr;
}
export function expandGlobalConstants(ex: Prim, hashAndValue: GlobalConstantHashAndValue): Expr {
	if (ex.args !== undefined && ex.args.length === 1 && 'string' in ex.args[0] && ex.args[0].string in hashAndValue) {
		return hashAndValue[ex.args[0].string];
	}

	return ex;
}
export type SourceReference = {
  first: number;
  last: number;
  macro?: Expr;
  globalConstant?: Expr;
};
function assertArgs<N extends number>(ex: Prim, n: N):
    ex is N extends 0 ?
        NoArgs<Prim<string>> :
        ReqArgs<Prim<string, Tuple<N, Expr>>> {
    if ((n === 0 && ex.args === undefined) || ex.args?.length === n) {
        return true;
    }
    throw new MacroError(ex, `macro ${ex.prim} expects ${n} arguments, was given ${ex.args?.length}`);
}
export const sourceReference: unique symbol = Symbol('source_reference');
export const DefaultProtocol = Protocol.Psithaca2;
export function expandMacros(ex: Prim, opt?: ProtocolOptions): Expr {
    const proto = opt?.protocol || DefaultProtocol;

    function mayRename(annots?: string[]): Prim[] {
        return annots !== undefined ? [{ prim: "RENAME", annots }] : [];
    }

    switch (ex.prim) {
    // Compare
    case "CMPEQ":
    case "CMPNEQ":
    case "CMPLT":
    case "CMPGT":
    case "CMPLE":
    case "CMPGE":
        if (assertArgs(ex, 0)) {
            return [
                { prim: "COMPARE" },
                mkPrim({ prim: ex.prim.slice(3), annots: ex.annots }),
            ];
        }
        break;

    case "IFEQ":
    case "IFNEQ":
    case "IFLT":
    case "IFGT":
    case "IFLE":
    case "IFGE":
        if (assertArgs(ex, 2)) {
            return [
                { prim: ex.prim.slice(2) },
                mkPrim({ prim: "IF", annots: ex.annots, args: ex.args }),
            ];
        }
        break;

    case "IFCMPEQ":
    case "IFCMPNEQ":
    case "IFCMPLT":
    case "IFCMPGT":
    case "IFCMPLE":
    case "IFCMPGE":
        if (assertArgs(ex, 2)) {
            return [
                { prim: "COMPARE" },
                { prim: ex.prim.slice(5) },
                mkPrim({ prim: "IF", annots: ex.annots, args: ex.args }),
            ];
        }
        break;

        // Fail
    case "FAIL":
        if (assertArgs(ex, 0) && assertNoAnnots(ex)) {
            return [
                { prim: "UNIT" },
                { prim: "FAILWITH" },
            ];
        }
        break;

        // Assertion macros
    case "ASSERT":
        if (assertArgs(ex, 0) && assertNoAnnots(ex)) {
            return [{
                prim: "IF", args: [
                    [],
                    [[{ prim: "UNIT" }, { prim: "FAILWITH" }]],
                ]
            }];
        }
        break;

    case "ASSERT_EQ":
    case "ASSERT_NEQ":
    case "ASSERT_LT":
    case "ASSERT_GT":
    case "ASSERT_LE":
    case "ASSERT_GE":
        if (assertArgs(ex, 0) && assertNoAnnots(ex)) {
            return [
                { prim: ex.prim.slice(7) },
                {
                    prim: "IF", args: [
                        [],
                        [[{ prim: "UNIT" }, { prim: "FAILWITH" }]],
                    ]
                },
            ];
        }
        break;

    case "ASSERT_CMPEQ":
    case "ASSERT_CMPNEQ":
    case "ASSERT_CMPLT":
    case "ASSERT_CMPGT":
    case "ASSERT_CMPLE":
    case "ASSERT_CMPGE":
        if (assertArgs(ex, 0) && assertNoAnnots(ex)) {
            return [
                [
                    { prim: "COMPARE" },
                    { prim: ex.prim.slice(10) },
                ],
                {
                    prim: "IF", args: [
                        [],
                        [[{ prim: "UNIT" }, { prim: "FAILWITH" }]],
                    ]
                },
            ];
        }
        break;

    case "ASSERT_NONE":
        if (assertArgs(ex, 0) && assertNoAnnots(ex)) {
            return [{
                prim: "IF_NONE", args: [
                    [],
                    [[{ prim: "UNIT" }, { prim: "FAILWITH" }]],
                ]
            }];
        }
        break;

    case "ASSERT_SOME":
        if (assertArgs(ex, 0)) {
            return [{
                prim: "IF_NONE", args: [
                    [[{ prim: "UNIT" }, { prim: "FAILWITH" }]],
                    mayRename(ex.annots),
                ]
            }];
        }
        break;

    case "ASSERT_LEFT":
        if (assertArgs(ex, 0)) {
            return [{
                prim: "IF_LEFT", args: [
                    mayRename(ex.annots),
                    [[{ prim: "UNIT" }, { prim: "FAILWITH" }]],
                ]
            }];
        }
        break;

    case "ASSERT_RIGHT":
        if (assertArgs(ex, 0)) {
            return [{
                prim: "IF_LEFT", args: [
                    [[{ prim: "UNIT" }, { prim: "FAILWITH" }]],
                    mayRename(ex.annots),
                ]
            }];
        }
        break;

        // Syntactic conveniences

    case "IF_SOME":
        if (assertArgs(ex, 2)) {
            return [mkPrim({ prim: "IF_NONE", annots: ex.annots, args: [ex.args[1], ex.args[0]] })];
        }
        break;

    case "IF_RIGHT":
        if (assertArgs(ex, 2)) {
            return [mkPrim({ prim: "IF_LEFT", annots: ex.annots, args: [ex.args[1], ex.args[0]] })];
        }
        break;

        // CAR/CDR n
    case "CAR":
    case "CDR":
        if (ex.args !== undefined) {
            if (assertArgs(ex, 1) && assertIntArg(ex, ex.args[0])) {
                const n = parseInt(ex.args[0].int, 10);
                return mkPrim({
                    prim: "GET",
                    args: [{ int: ex.prim === "CAR" ? String(n * 2 + 1) : String(n * 2) }],
                    annots: ex.annots,
                });
            }
        } else {
            return ex;
        }
    }

    // More syntactic conveniences

    // PAPPAIIR macro
    if (pairRe.test(ex.prim)) {
        if (assertArgs(ex, 0)) {
            const { fields, rest } = filterAnnotations(ex.annots);
            const { r } = parsePairUnpairExpr(ex, ex.prim.slice(1), fields, (l, r, top) => [...(l || []), ...(r || []), top]);

            return r.map(([v, a], i) => {
                const ann = [
                    ...trimLast(a, null).map(v => v === null ? "%" : v),
                    ...((v === 0 && i === r.length - 1) ? rest : [])];

                const leaf = mkPrim({ prim: "PAIR", annots: ann.length !== 0 ? ann : undefined, });

                return v === 0 ? leaf : {
                    prim: "DIP",
                    args: v === 1 ? [[leaf]] : [{ int: String(v) }, [leaf]],
                };
            });
        }
    }

    // UNPAPPAIIR macro
    if (unpairRe.test(ex.prim)) {
        if (ProtoInferiorTo(proto,  Protocol.PtEdo2Zk) && assertArgs(ex, 0)) {
            const { r } = parsePairUnpairExpr(ex, ex.prim.slice(3), ex.annots || [], (l, r, top) => [top, ...(r || []), ...(l || [])]);
            return r.map(([v, a]) => {
                const leaf: Prim[] = [
                    { prim: "DUP" },
                    mkPrim({ prim: "CAR", annots: a[0] !== null ? [a[0]] : undefined }),
                    {
                        prim: "DIP",
                        args: [[mkPrim({ prim: "CDR", annots: a[1] !== null ? [a[1]] : undefined })]],
                    }
                ];

                return v === 0 ? leaf : {
                    prim: "DIP",
                    args: v === 1 ? [[leaf]] : [{ int: String(v) }, [leaf]],
                };
            });
        }
        else {
            if (ex.prim === "UNPAIR") {
                return ex;
            }
            if (assertArgs(ex, 0)) {
                // 008_edo: annotations are deprecated
                const { r } = parsePairUnpairExpr(ex, ex.prim.slice(3), [], (l, r, top) => [top, ...(r || []), ...(l || [])]);
                return r.map(([v]) => {
                    const leaf = mkPrim({
                        prim: "UNPAIR",
                    });

                    return v === 0 ? leaf : {
                        prim: "DIP",
                        args: v === 1 ? [[leaf]] : [{ int: String(v) }, [leaf]],
                    };
                });
            }
        }
    }

    // C[AD]+R macro
    if (cadrRe.test(ex.prim)) {
        if (assertArgs(ex, 0)) {
            const ch = [...ex.prim.slice(1, ex.prim.length - 1)];

            return ch.map<Prim>((c, i) => {
                const ann = i === ch.length - 1 ? ex.annots : undefined;
                switch (c) {
                case "A":
                    return mkPrim({ prim: "CAR", annots: ann });
                case "D":
                    return mkPrim({ prim: "CDR", annots: ann });
                default:
                    throw new MacroError(ex, `unexpected character: ${c}`);
                }
            });
        }
    }

    // SET_C[AD]+R macro
    if (setCadrRe.test(ex.prim)) {
        if (assertArgs(ex, 0)) {
            const { fields, rest } = filterAnnotations(ex.annots);
            if (fields.length > 1) {
                throw new MacroError(ex, `unexpected annotation on macro ${ex.prim}: ${fields}`);
            }

            const term = fields.length !== 0 ?
                {
                    a: [
                        { prim: "DUP" },
                        { prim: "CAR", annots: fields },
                        { prim: "DROP" },
                        { prim: "CDR", annots: ["@%%"] },
                        { prim: "SWAP" },
                        { prim: "PAIR", annots: [fields[0], "%@"] },
                    ],
                    d: [
                        { prim: "DUP" },
                        { prim: "CDR", annots: fields },
                        { prim: "DROP" },
                        { prim: "CAR", annots: ["@%%"] },
                        { prim: "PAIR", annots: ["%@", fields[0]] },
                    ],
                } :
                {
                    a: [
                        { prim: "CDR", annots: ["@%%"] },
                        { prim: "SWAP" },
                        { prim: "PAIR", annots: ["%", "%@"] },
                    ],
                    d: [
                        { prim: "CAR", annots: ["@%%"] },
                        { prim: "PAIR", annots: ["%@", "%"] },
                    ],
                };

            return parseSetMapCadr(ex, ex.prim.slice(5, ex.prim.length - 1), rest, term);
        }
    }

    // MAP_C[AD]+R macro
    if (mapCadrRe.test(ex.prim)) {
        if (assertArgs(ex, 1)) {
            const { fields } = filterAnnotations(ex.annots);
            if (fields.length > 1) {
                throw new MacroError(ex, `unexpected annotation on macro ${ex.prim}: ${fields}`);
            }

            const term = {
                a: [
                    { prim: "DUP" },
                    { prim: "CDR", annots: ["@%%"] },
                    {
                        prim: "DIP", args: [[
                            mkPrim({ prim: "CAR", annots: fields.length !== 0 ? ["@" + fields[0].slice(1)] : undefined }),
                            ex.args[0],
                        ]]
                    },
                    { prim: "SWAP" },
                    { prim: "PAIR", annots: [fields.length !== 0 ? fields[0] : "%", "%@"] },
                ],
                d: [
                    { prim: "DUP" },
                    mkPrim({ prim: "CDR", annots: fields.length !== 0 ? ["@" + fields[0].slice(1)] : undefined }),
                    ex.args[0],
                    { prim: "SWAP" },
                    { prim: "CAR", annots: ["@%%"] },
                    { prim: "PAIR", annots: ["%@", fields.length !== 0 ? fields[0] : "%"] },
                ],
            };

            return parseSetMapCadr(ex, ex.prim.slice(5, ex.prim.length - 1), [], term);
        }
    }

    // Expand deprecated DI...IP to [DIP n]
    if (diipRe.test(ex.prim)) {
        if (assertArgs(ex, 1)) {
            let n = 0;
            while (ex.prim[1 + n] === "I") { n++; }
            return mkPrim({ prim: "DIP", args: [{ int: String(n) }, ex.args[0]] });
        }
    }

    // Expand DU...UP and DUP n
    if (duupRe.test(ex.prim)) {
        let n = 0;
        while (ex.prim[1 + n] === "U") { n++; }
        if (ProtoInferiorTo(proto, Protocol.PtEdo2Zk)){
            if (n === 1) {
                if (ex.args === undefined) {
                    return ex; // skip
                }
                if (assertArgs(ex, 1) && assertIntArg(ex, ex.args[0])) {
                    n = parseInt(ex.args[0].int, 10);
                }
            } else {
                assertArgs(ex, 0);
            }

            if (n === 1) {
                return [mkPrim({ prim: "DUP", annots: ex.annots })];

            } else if (n === 2) {
                return [
                    {
                        prim: "DIP",
                        args: [[mkPrim({ prim: "DUP", annots: ex.annots })]],
                    },
                    { prim: "SWAP" },
                ];

            } else {
                return [
                    {
                        prim: "DIP",
                        args: [
                            { int: String(n - 1) },
                            [mkPrim({ prim: "DUP", annots: ex.annots })],
                        ],
                    },
                    {
                        prim: "DIG",
                        args: [{ int: String(n) }],
                    },
                ];
            }
        }
        else {
            if (n === 1) {
                return ex;
            }
            if (assertArgs(ex, 0)) {
                return mkPrim({ prim: "DUP", args: [{ int: String(n) }], annots: ex.annots });
            }
        }
    }

    return ex;
}
export class Parser {
  constructor(private opt?: ParserOptions) {}

  private expand(ex: Prim): Expr {
    if (this.opt?.expandGlobalConstant !== undefined && ex.prim === 'constant') {
      const ret = expandGlobalConstants(ex, this.opt.expandGlobalConstant);
      if (ret !== ex) {
        ret[sourceReference] = {
          ...(ex[sourceReference] || { first: 0, last: 0 }),
          globalConstant: ex,
        };
      }
      return ret;
    }
    if (this.opt?.expandMacros !== undefined ? this.opt?.expandMacros : true) {
      const ret = expandMacros(ex, this.opt);
      if (ret !== ex) {
        ret[sourceReference] = { ...(ex[sourceReference] || { first: 0, last: 0 }), macro: ex };
      }
      return ret;
    } else {
      return ex;
    }
  }

  private parseListExpr(scanner: Iterator<Token>, start: Token): Expr {
    const ref: SourceReference = {
      first: start.first,
      last: start.last,
    };

    const expectBracket = start.t === '(';
    let tok: IteratorResult<Token>;
    if (expectBracket) {
      tok = scanner.next();
      if (tok.done) {
        throw errEOF;
      }
      ref.last = tok.value.last;
    } else {
      tok = { value: start };
    }

    if (tok.value.t !== Literal.Ident) {
      throw new MichelineParseError(tok.value, `not an identifier: ${tok.value.v}`);
    }

    const ret: Prim = {
      prim: tok.value.v,
      [sourceReference]: ref,
    };

    for (;;) {
      const tok = scanner.next();
      if (tok.done) {
        if (expectBracket) {
          throw errEOF;
        }
        break;
      } else if (tok.value.t === ')') {
        if (!expectBracket) {
          throw new MichelineParseError(tok.value, 'unexpected closing bracket');
        }
        ref.last = tok.value.last;
        break;
      } else if (isAnnotation(tok.value)) {
        ret.annots = ret.annots || [];
        ret.annots.push(tok.value.v);
        ref.last = tok.value.last;
      } else {
        ret.args = ret.args || [];
        const arg = this.parseExpr(scanner, tok.value);
        ref.last = arg[sourceReference]?.last || ref.last;
        ret.args.push(arg);
      }
    }
    return this.expand(ret);
  }

  private parseArgs(scanner: Iterator<Token>, start: Token): [Prim, IteratorResult<Token>] {
    // Identifier with arguments
    const ref: SourceReference = {
      first: start.first,
      last: start.last,
    };
    const p: Prim = {
      prim: start.v,
      [sourceReference]: ref,
    };

    for (;;) {
      const t = scanner.next();
      if (t.done || t.value.t === '}' || t.value.t === ';') {
        return [p, t];
      }

      if (isAnnotation(t.value)) {
        ref.last = t.value.last;
        p.annots = p.annots || [];
        p.annots.push(t.value.v);
      } else {
        const arg = this.parseExpr(scanner, t.value);
        ref.last = arg[sourceReference]?.last || ref.last;
        p.args = p.args || [];
        p.args.push(arg);
      }
    }
  }

  private parseSequenceExpr(scanner: Iterator<Token>, start: Token): List<Expr> {
    const ref: SourceReference = {
      first: start.first,
      last: start.last,
    };
    const seq: List<Expr> = [];
    seq[sourceReference] = ref;

    const expectBracket = start.t === '{';
    let tok: IteratorResult<Token> | null = start.t === '{' ? null : { value: start };

    for (;;) {
      if (tok === null) {
        tok = scanner.next();
        if (!tok.done) {
          ref.last = tok.value.last;
        }
      }
      if (tok.done) {
        if (expectBracket) {
          throw errEOF;
        } else {
          return seq;
        }
      }

      if (tok.value.t === '}') {
        if (!expectBracket) {
          throw new MichelineParseError(tok.value, 'unexpected closing bracket');
        } else {
          return seq;
        }
      } else if (tok.value.t === Literal.Ident) {
        // Identifier with arguments
        const [itm, n] = this.parseArgs(scanner, tok.value);
        ref.last = itm[sourceReference]?.last || ref.last;
        seq.push(this.expand(itm));
        tok = n;
      } else {
        // Other
        const ex = this.parseExpr(scanner, tok.value);
        ref.last = ex[sourceReference]?.last || ref.last;
        seq.push(ex);
        tok = null;
      }

      if (tok === null) {
        tok = scanner.next();
        if (!tok.done) {
          ref.last = tok.value.last;
        }
      }
      if (!tok.done && tok.value.t === ';') {
        tok = null;
      }
    }
  }

  private parseExpr(scanner: Iterator<Token>, tok: Token): Expr {
    switch (tok.t) {
      case Literal.Ident:
        return this.expand({
          prim: tok.v,
          [sourceReference]: { first: tok.first, last: tok.last },
        });

      case Literal.Number:
        return { int: tok.v, [sourceReference]: { first: tok.first, last: tok.last } };

      case Literal.String:
        return {
          string: JSON.parse(tok.v) as string,
          [sourceReference]: { first: tok.first, last: tok.last },
        };

      case Literal.Bytes:
        return { bytes: tok.v.slice(2), [sourceReference]: { first: tok.first, last: tok.last } };

      case '{':
        return this.parseSequenceExpr(scanner, tok);

      default:
        return this.parseListExpr(scanner, tok);
    }
  }
  parseSequence(src: string): Expr[] | null {
    if (typeof src !== 'string') {
      throw new TypeError(`string type was expected, got ${typeof src} instead`);
    }

    const scanner = scan(src);
    const tok = scanner.next();
    if (tok.done) {
      return null;
    }
    return this.parseSequenceExpr(scanner, tok.value);
  }
  parseList(src: string): Expr | null {
    if (typeof src !== 'string') {
      throw new TypeError(`string type was expected, got ${typeof src} instead`);
    }

    const scanner = scan(src);
    const tok = scanner.next();
    if (tok.done) {
      return null;
    }
    return this.parseListExpr(scanner, tok.value);
  }
  parseMichelineExpression(src: string): Expr | null {
    if (typeof src !== 'string') {
      throw new TypeError(`string type was expected, got ${typeof src} instead`);
    }

    const scanner = scan(src);
    const tok = scanner.next();
    if (tok.done) {
      return null;
    }
    return this.parseExpr(scanner, tok.value);
  }
  parseScript(src: string): Expr[] | null {
    return this.parseSequence(src);
  }
  parseData(src: string): Expr | null {
    return this.parseList(src);
  }
  parseJSON(src: object): Expr {
    if (typeof src !== 'object') {
      throw new TypeError(`object type was expected, got ${typeof src} instead`);
    }

    if (Array.isArray(src)) {
      const ret: Expr[] = [];
      for (const n of src) {
        if (n === null || typeof n !== 'object') {
          throw new JSONParseError(n, `unexpected sequence element: ${n}`);
        }
        ret.push(this.parseJSON(n));
      }
      return ret;
    } else if ('prim' in src) {
      const p = src as { prim: unknown; annots?: unknown[]; args?: unknown[] };
      if (
        typeof p.prim === 'string' &&
        (p.annots === undefined || Array.isArray(p.annots)) &&
        (p.args === undefined || Array.isArray(p.args))
      ) {
        const ret: Prim = {
          prim: p.prim,
        };

        if (p.annots !== undefined) {
          for (const a of p.annots) {
            if (typeof a !== 'string') {
              throw new JSONParseError(a, `string expected: ${a}`);
            }
          }
          ret.annots = p.annots;
        }

        if (p.args !== undefined) {
          ret.args = [];
          for (const a of p.args) {
            if (a === null || typeof a !== 'object') {
              throw new JSONParseError(a, `unexpected argument: ${a}`);
            }
            ret.args.push(this.parseJSON(a));
          }
        }

        return this.expand(ret);
      }

      throw new JSONParseError(src, `malformed prim expression: ${src}`);
    } else if ('string' in src) {
      if (typeof (src as StringLiteral).string === 'string') {
        return { string: (src as StringLiteral).string };
      }

      throw new JSONParseError(src, `malformed string literal: ${src}`);
    } else if ('int' in src) {
      if (typeof (src as IntLiteral).int === 'string' && intRe.test((src as IntLiteral).int)) {
        return { int: (src as IntLiteral).int };
      }

      throw new JSONParseError(src, `malformed int literal: ${src}`);
    } else if ('bytes' in src) {
      if (
        typeof (src as BytesLiteral).bytes === 'string' &&
        bytesRe.test((src as BytesLiteral).bytes)
      ) {
        return { bytes: (src as BytesLiteral).bytes };
      }

      throw new JSONParseError(src, `malformed bytes literal: ${src}`);
    } else {
      throw new JSONParseError(src, `unexpected object: ${src}`);
    }
  }
}
export class MichelCodecParser implements ParserProvider {
  constructor(private context: Context) {}

  private async getNextProto(): Promise<ProtocolID> {
    const { next_protocol } = await this.context.rpc.getBlockMetadata();
    return next_protocol as ProtocolID;
  }

  async parseScript(src: string): Promise<Expr[] | null> {
    const parser = new Parser({ protocol: await this.getNextProto() });
    return parser.parseScript(src);
  }

  async parseMichelineExpression(src: string): Promise<Expr | null> {
    const parser = new Parser({ protocol: await this.getNextProto() });
    return parser.parseMichelineExpression(src);
  }

  async parseJSON(src: object): Promise<Expr> {
    const parser = new Parser({ protocol: await this.getNextProto() });
    return parser.parseJSON(src);
  }

  async prepareCodeOrigination(params: OriginateParams): Promise<OriginateParams> {
    const parsedParams = params;
    parsedParams.code = await this.formatCodeParam(params.code);
    if (params.init) {
      parsedParams.init = await this.formatInitParam(params.init);
    } else if (params.storage) {
      const storageType = (parsedParams.code as Expr[]).find(
        (p): p is Prim => 'prim' in p && p.prim === 'storage'
      );
      if (!storageType?.args) {
        throw new InvalidCodeParameter(
          'The storage section is missing from the script',
          params.code
        );
      }
      const schema = new Schema(storageType.args[0] as MichelsonV1Expression);
      const globalconstantsHashAndValue = await this.findGlobalConstantsHashAndValue(schema);

      if (Object.keys(globalconstantsHashAndValue).length !== 0) {
        // If there are global constants in the storage part of the contract code,
        // they need to be locally expanded in order to encode the storage arguments
        const p = new Parser({ expandGlobalConstant: globalconstantsHashAndValue });
        const storageTypeNoGlobalConst = p.parseJSON(storageType.args[0]);
        const schemaNoGlobalConst = new Schema(storageTypeNoGlobalConst);
        parsedParams.init = schemaNoGlobalConst.Encode(params.storage);
      } else {
        parsedParams.init = schema.Encode(params.storage);
      }
      delete parsedParams.storage;
    }
    return parsedParams;
  }

  private async formatCodeParam(code: string | object[]) {
    let parsedCode: Expr[];
    if (typeof code === 'string') {
      const c = await this.parseScript(code);
      if (c === null) {
        throw new InvalidCodeParameter('Invalid code parameter', code);
      }
      parsedCode = c;
    } else {
      const c = await this.parseJSON(code);
      const order = ['parameter', 'storage', 'code'];
      // Ensure correct ordering for RPC
      parsedCode = (c as Prim[]).sort((a, b) => order.indexOf(a.prim) - order.indexOf(b.prim));
    }
    return parsedCode;
  }

  private async formatInitParam(init: string | object) {
    let parsedInit: Expr;
    if (typeof init === 'string') {
      const c = await this.parseMichelineExpression(init);
      if (c === null) {
        throw new InvalidInitParameter('Invalid init parameter', init);
      }
      parsedInit = c;
    } else {
      parsedInit = await this.parseJSON(init);
    }
    return parsedInit;
  }

  private async findGlobalConstantsHashAndValue(schema: Schema) {
    const globalConstantTokens = schema.findToken('constant');
    const globalConstantsHashAndValue: GlobalConstantHashAndValue = {};

    if (globalConstantTokens.length !== 0) {
      for (const token of globalConstantTokens) {
        const tokenArgs = token.tokenVal.args;
        if (tokenArgs) {
          const hash: string = tokenArgs[0]['string'];
          const michelineValue = await this.context.globalConstantsProvider.getGlobalConstantByHash(
            hash
          );
          Object.assign(globalConstantsHashAndValue, {
            [hash]: michelineValue,
          });
        }
      }
    }
    return globalConstantsHashAndValue;
  }
}
export type TimeStampMixed = Date | string;
export type OperationStatus = 'pending' | 'unknown' | OperationResultStatusEnum;
export class TransactionWalletOperation {
    constructor(
        public readonly opHash: string,
        protected readonly context: Context,
        private _newHead$: Observable<BlockResponse>
    ) {
        // if (validateOperation(this.opHash) !== ValidationResult.VALID) {
        // throw new InvalidOperationHashError(`Invalid operation hash: ${this.opHash}`);
        // }
        // this.confirmed$
        // .pipe(
        //     first(),
        //     catchError(() => of(undefined))
        // )
        // .subscribe();
    }

    // public async revealOperation() {
    //     const operationResult = await this.operationResults();
    //     return operationResult.find(x => x.kind === OpKind.REVEAL) as
    //     | OperationContentsAndResultReveal
    //     | undefined;
    // }

    public async transactionOperation() {
        const operationResult = await this.operationResults();
        return operationResult.find(x => x.kind === OpKind.TRANSACTION) as
        | OperationContentsAndResultTransaction
        | undefined;
    }

    public async status(): Promise<OperationStatus> {
        if (!this._included) {
        return 'pending';
        }

        const op = await this.transactionOperation();
        if (!op) {
        return 'unknown';
        }

        return op.metadata.operation_result.status;
    }
    protected _operationResult = new ReplaySubject<OperationContentsAndResult[]>(1);
    // protected _includedInBlock = new ReplaySubject<BlockResponse>(1);
    protected _included = false;

    private lastHead: BlockResponse | undefined;
    // protected newHead$: Observable<BlockResponse> = this._newHead$.pipe(
    //     tap((newHead) => {
    //     if (
    //         !this._included &&
    //         this.lastHead &&
    //         newHead.header.level - this.lastHead.header.level > 1
    //     ) {
    //         throw new MissedBlockDuringConfirmationError();
    //     }

    //     this.lastHead = newHead;
    //     }),
    //     shareReplay({ bufferSize: 1, refCount: true })
    // );

    // Observable that emit once operation is seen in a block
    // private confirmed$ = this.newHead$.pipe(
    //     map((head) => {
    //     for (const opGroup of head.operations) {
    //         for (const op of opGroup) {
    //         if (op.hash === this.opHash) {
    //             this._included = true;
    //             this._includedInBlock.next(head);
    //             this._operationResult.next(op.contents as OperationContentsAndResult[]);

    //             // Return the block where the operation was found
    //             return head;
    //         }
    //         }
    //     }
    //     }),
    //     filter<BlockResponse | undefined, BlockResponse>((x): x is BlockResponse => {
    //     return typeof x !== 'undefined';
    //     }),
    //     first(),
    //     shareReplay({ bufferSize: 1, refCount: true })
    // );

    async operationResults() {
        return this._operationResult.pipe(first()).toPromise();
    }

    /**
     * @description Receipt expose the total amount of tezos token burn and spent on fees
     * The promise returned by receipt will resolve only once the transaction is included
     */
    // async receipt(): Promise<Receipt> {
    //     return receiptFromOperation(await this.operationResults());
    // }

    // async getCurrentConfirmation() {
    //     if (!this._included) {
    //     return 0;
    //     }

    //     return combineLatest([this._includedInBlock, from(this.context.rpc.getBlock())])
    //     .pipe(
    //         map(([foundAtBlock, head]) => {
    //         return head.header.level - foundAtBlock.header.level + 1;
    //         }),
    //         first()
    //     )
    //     .toPromise();
    // }

    // async isInCurrentBranch(tipBlockIdentifier = 'head') {
    //     // By default it is assumed that the operation is in the current branch
    //     if (!this._included) {
    //     return true;
    //     }

    //     const tipBlockHeader = await this.context.rpc.getBlockHeader({ block: tipBlockIdentifier });
    //     const inclusionBlock = await this._includedInBlock.pipe(first()).toPromise();

    //     const levelDiff = tipBlockHeader.level - inclusionBlock.header.level;

    //     // Block produced before the operation is included are assumed to be part of the current branch
    //     if (levelDiff <= 0) {
    //     return true;
    //     }

    //     const tipBlockLevel = Math.min(
    //     inclusionBlock.header.level + levelDiff,
    //     inclusionBlock.header.level + MAX_BRANCH_ANCESTORS
    //     );

    //     const blocks = new Set(await this.context.rpc.getLiveBlocks({ block: String(tipBlockLevel) }));
    //     return blocks.has(inclusionBlock.hash);
    // }

    confirmationObservable(confirmations?: number) {
        if (typeof confirmations !== 'undefined' && confirmations < 1) {
        throw new Error('Confirmation count must be at least 1');
        }

        const { defaultConfirmationCount } = this.context.config;

        const conf = confirmations !== undefined ? confirmations : defaultConfirmationCount;

        if (conf === undefined) {
        throw new Error('Default confirmation count can not be undefined!');
        }

        return combineLatest([this._includedInBlock, this.newHead$]).pipe(
        distinctUntilChanged(([, previousHead], [, newHead]) => {
            return previousHead.hash === newHead.hash;
        }),
        map(([foundAtBlock, head]) => {
            return {
            block: head,
            expectedConfirmation: conf,
            currentConfirmation: head.header.level - foundAtBlock.header.level + 1,
            completed: head.header.level - foundAtBlock.header.level >= conf - 1,
            isInCurrentBranch: () => this.isInCurrentBranch(head.hash),
            };
        }),
        takeWhile(({ completed }) => !completed, true)
        );
    }

    /**
     *
     * @param confirmations [0] Number of confirmation to wait for
     */
    confirmation(confirmations?: number) {
        return this.confirmationObservable(confirmations).toPromise();
    }
}


async function createTransactionOperation(
    hash: string, 
    config: OperationFactoryConfig = {}
): Promise<TransactionWalletOperation> {
    return new TransactionWalletOperation(
        hash,
        this.context.clone(),
        await this.createHeadObservableFromConfig(config)
    );
}

function transfer(params: WalletTransferParams) {
    return walletCommand(async () => {
        const mappedParams = await mapTransferParamsToWalletParams(
            async () => params
        );
        const opHash = await sendOperations([mappedParams]);
        return createTransactionOperation(opHash);
    });
}
