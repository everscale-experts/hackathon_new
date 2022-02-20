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
  originate<TWallet extends DefaultWalletType = DefaultWalletType>(
    params: WalletOriginateParams<ContractStorageType<TWallet>>
  ): { send: () => Promise<OriginationWalletOperation<TWallet>> } {
    return this.walletCommand(async () => {
      const mappedParams = await this.walletProvider.mapOriginateParamsToWalletParams(() =>
        this.context.parser.prepareCodeOrigination({
          ...params as WalletOriginateParams,
        })
      );
      const opHash = await this.walletProvider.sendOperations([mappedParams]);
      if (!this.context.proto) {
        this.context.proto = (await this.context.rpc.getBlock()).protocol as Protocols;
      }
      return this.context.operationFactory.createOriginationOperation(opHash) as Promise<OriginationWalletOperation<TWallet>>;
    });
  }

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

  Typecheck(val: any) {
    if (this.root instanceof BigMapToken && Number.isInteger(Number(val))) {
      return true;
    }
    try {
      this.root.EncodeObject(val);
      return true;
    } catch (ex) {
      return false;
    }
  }

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

  EncodeBigMapKey(key: BigMapKeyType) {
    if (!this.bigMap) {
      throw new Error('No big map schema');
    }

    try {
      return this.bigMap.KeySchema.ToBigMapKey(key);
    } catch (ex) {
      throw new Error('Unable to encode big map key: ' + ex);
    }
  }

  Encode(_value?: any) {
    try {
      return this.root.EncodeObject(_value);
    } catch (ex) {
      if (ex instanceof TokenValidationError) {
        throw ex;
      }

      throw new Error(`Unable to encode storage object. ${ex}`);
    }
  }

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
      const sch = collapse(schema);
      const str = collapse(storage, 'Pair');
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
